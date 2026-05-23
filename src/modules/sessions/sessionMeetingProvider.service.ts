import crypto from 'crypto';
import { env } from '../../config/env';
import { MeetingProvider } from './session.model';

export interface MeetingRoomRequest {
  sessionId: string;
  topic: string;
}

export interface MeetingRoom {
  provider: MeetingProvider;
  roomId: string;
  url: string;
}

export interface ParticipantMeetingLinkRequest {
  meetingUrl: string;
  displayName: string;
}

export interface SessionMeetingProvider {
  provider: MeetingProvider;
  createRoom(input: MeetingRoomRequest): MeetingRoom;
  getParticipantUrl(input: ParticipantMeetingLinkRequest): string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

class JitsiMeetingProvider implements SessionMeetingProvider {
  provider = MeetingProvider.JITSI;

  createRoom(input: MeetingRoomRequest): MeetingRoom {
    const nonce = crypto.randomBytes(8).toString('hex');
    const topicSlug = slugify(input.topic || 'mentorship-session');
    const roomId = `ascendpath-${topicSlug}-${input.sessionId}-${nonce}`;
    const url = `https://${env.JITSI_DOMAIN}/${roomId}`;

    return {
      provider: this.provider,
      roomId,
      url,
    };
  }

  getParticipantUrl(input: ParticipantMeetingLinkRequest): string {
    const url = new URL(input.meetingUrl);
    url.searchParams.set('userInfo.displayName', input.displayName);
    url.searchParams.set('config.prejoinPageEnabled', 'true');
    url.searchParams.set('config.startWithAudioMuted', 'true');
    url.searchParams.set('config.startWithVideoMuted', 'false');
    return url.toString();
  }
}

const providers: Partial<Record<MeetingProvider, SessionMeetingProvider>> = {
  [MeetingProvider.JITSI]: new JitsiMeetingProvider(),
};

export const sessionMeetingProviderService = {
  getProvider(provider: MeetingProvider = MeetingProvider.JITSI) {
    return providers[provider] || providers[MeetingProvider.JITSI]!;
  },
};
