import { vi } from "vitest";

export const mockSendMail = vi.fn();

vi.mock("@src/features/email/email.service", () => ({
  sendMail: mockSendMail,
}));
