import { AccessToken, RoomServiceClient, type VideoGrant } from "livekit-server-sdk";

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

export async function countActiveParticipants(roomName: string) {
  try {
    const svc = getRoomServiceClient();
    const participants = await svc.listParticipants(roomName);
    return participants.length;
  } catch {
    return 0;
  }
}
