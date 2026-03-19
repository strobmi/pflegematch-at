const WHEREBY_API_URL = "https://api.whereby.dev/v1";

interface WherebyMeetingResponse {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl: string;
}

export async function createWherebyMeeting(
  scheduledAt: Date,
  durationMin: number
): Promise<WherebyMeetingResponse> {
  const apiKey = process.env.WHEREBY_API_KEY;
  if (!apiKey) throw new Error("WHEREBY_API_KEY is not set");

  const endDate = new Date(scheduledAt.getTime() + durationMin * 60 * 1000);

  const res = await fetch(`${WHEREBY_API_URL}/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: scheduledAt.toISOString(),
      endDate: endDate.toISOString(),
      roomNamePrefix: "pflegematch-",
      roomMode: "normal",
      endpointV2: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whereby API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    meetingId: data.meetingId,
    roomUrl: data.roomUrl,
    hostRoomUrl: data.hostRoomUrl,
  };
}

export async function deleteWherebyMeeting(
  wherebyMeetingId: string
): Promise<void> {
  const apiKey = process.env.WHEREBY_API_KEY;
  if (!apiKey) throw new Error("WHEREBY_API_KEY is not set");

  const res = await fetch(`${WHEREBY_API_URL}/meetings/${wherebyMeetingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Whereby delete error ${res.status}: ${text}`);
  }
}
