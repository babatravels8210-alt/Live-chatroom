declare module 'agora-rtc-sdk-ng' {
  export interface IAgoraRTCClient {
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    join(appId: string, channel: string, token: string | null, uid?: string | number | null): Promise<string | number>;
    leave(): Promise<void>;
    publish(tracks: any[]): Promise<void>;
    unpublish(tracks?: any[]): Promise<void>;
    subscribe(user: any, mediaType: string): Promise<any>;
    unsubscribe(user: any, mediaType?: string): Promise<void>;
    setClientRole(role: string): Promise<void>;
    remoteUsers: any[];
  }

  export interface IMicrophoneAudioTrack {
    play(): void;
    stop(): void;
    close(): void;
    setEnabled(enabled: boolean): Promise<void>;
    setVolume(volume: number): void;
    getVolumeLevel(): number;
  }

  export interface ICameraVideoTrack {
    play(element: HTMLElement | string): void;
    stop(): void;
    close(): void;
    setEnabled(enabled: boolean): Promise<void>;
  }

  export function createClient(config: { mode: string; codec: string }): IAgoraRTCClient;
  export function createMicrophoneAudioTrack(): Promise<IMicrophoneAudioTrack>;
  export function createCameraVideoTrack(): Promise<ICameraVideoTrack>;

  const AgoraRTC: {
    createClient(config: { mode: string; codec: string }): IAgoraRTCClient;
    createMicrophoneAudioTrack(): Promise<IMicrophoneAudioTrack>;
    createCameraVideoTrack(): Promise<ICameraVideoTrack>;
  };

  export default AgoraRTC;
}