import {
  AccessToken,
  RoomServiceClient,
  EgressClient,
  EncodedFileOutput,
  S3Upload,
  EgressStatus,
  type VideoGrant,
} from "livekit-server-sdk";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

function toHttpUrl(wsUrl: string) {
  return wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

export function getLiveKitUrl() {
  return requireEnv("LIVEKIT_URL");
}

export function getRoomServiceClient() {
  return new RoomServiceClient(
    toHttpUrl(requireEnv("LIVEKIT_URL")),
    requireEnv("LIVEKIT_API_KEY"),
    requireEnv("LIVEKIT_API_SECRET")
  );
}

export async function mintParticipantToken(options: {
  roomName: string;
  identity: string;
  participantName: string;
  grant: Omit<VideoGrant, "room" | "roomJoin">;
  metadata?: string;
}) {
  const at = new AccessToken(requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"), {
    identity: options.identity,
    name: options.participantName,
    metadata: options.metadata,
    ttl: "6h",
  });
  at.addGrant({ roomJoin: true, room: options.roomName, ...options.grant });
  return at.toJwt();
}

export function getEgressClient() {
  return new EgressClient(
    toHttpUrl(requireEnv("LIVEKIT_URL")),
    requireEnv("LIVEKIT_API_KEY"),
    requireEnv("LIVEKIT_API_SECRET")
  );
}

export function buildRecordingFileOutput(roomSlug: string) {
  const key = `recordings/${roomSlug}/${Date.now()}.mp4`;
  const output = new EncodedFileOutput({
    filepath: key,
    output: {
      case: "s3",
      value: new S3Upload({
        accessKey: requireEnv("AWS_S3_ACCESS_KEY"),
        secret: requireEnv("AWS_S3_SECRET_KEY"),
        region: requireEnv("AWS_S3_REGION"),
        bucket: requireEnv("AWS_S3_BUCKET"),
      }),
    },
  });
  return { key, output };
}

export function mapEgressStatus(status: EgressStatus): string {
  switch (status) {
    case EgressStatus.EGRESS_STARTING:
      return "STARTING";
    case EgressStatus.EGRESS_ACTIVE:
      return "ACTIVE";
    case EgressStatus.EGRESS_ENDING:
      return "ENDING";
    case EgressStatus.EGRESS_COMPLETE:
      return "COMPLETE";
    default:
      return "FAILED";
  }
}

export async function countActiveParticipants(roomName: string) {
  try {
    const svc = getRoomServiceClient();
    const participants = await svc.listParticipants(roomName);
    return participants.length;
  } catch {
    return 0;
  }
}
