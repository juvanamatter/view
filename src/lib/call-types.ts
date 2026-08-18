export type CallSession = {
  token: string;
  livekitUrl: string;
  identity: string;
  room: {
    name: string;
    slug: string;
    muteOnEntry: boolean;
    cameraOnEntry: boolean;
    allowScreenShare: boolean;
    waitingRoom: boolean;
  };
};
