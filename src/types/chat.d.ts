import type { ParsedMessagePart } from "@twurple/chat";

export type FirebotChatMessage = {
    id: string;
    username: string;
    useridname: string;
    profilePicUrl: string;
    userId: string;
    roles: string[];
    badges: any[];
    customRewardId: string;
    color: string;
    rawText: string;
    parts: ParsedMessagePart[];
    whisper: boolean;
    action: boolean;
    isCheer: boolean;
    isAnnouncement: boolean;
    announcementColor: "PRIMARY" | "BLUE" | "GREEN" | "ORANGE" | "PURPLE";
    tagged: boolean;
    isFounder: boolean;
    isBroadcaster: boolean;
    isBot: boolean;
    isMod: boolean;
    isSubscriber: boolean;
    isVip: boolean;
    isCheer: boolean;
    isHighlighted: boolean;
    isAutoModHeld: boolean;
    autoModStatus: string;
    autoModReason: string;
    isFirstChat: boolean;
    isReturningChatter: boolean;
    isRaider: boolean;
    raidingFrom: string;
    isSuspiciousUser: boolean;
};

export type FirebotEmote = {
    url: string;
    animatedUrl: string;
    origin: string;
    code: string;
};