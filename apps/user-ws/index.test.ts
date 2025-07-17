import { resolve } from "bun";
import { describe, expect, test } from "bun:test";

const BACKEND_URL1 = "ws://localhost:8080";
const BACKEND_URL2 = "ws://localhost:8081";

describe("Chat app", () => {
  test("Message sent from room 1 reaches another participant in room 1", async () => {
    const ws1 = new WebSocket(BACKEND_URL1);
    const ws2 = new WebSocket(BACKEND_URL2);

    await new Promise<void>((resolve) => {
      let count = 0;
      ws1.onopen = () => {
        count = count + 1;
        if (count == 2) {
          resolve();
        }
      };

      ws2.onopen = () => {
        count = count + 1;
        if (count == 2) {
          resolve();
        }
      };
    });

    ws1.send(
      JSON.stringify({
        type: "join-room",
        room: "Room 1",
      })
    );

    ws2.send(
      JSON.stringify({
        type: "join-room",
        room: "Room 1",
      })
    );

    await new Promise<void>((resolve) => {
      ws1.onmessage = ({ data }) => {
        const parsedData = JSON.parse(data);
        expect(parsedData.type == "chat");
        expect(parsedData.type == "Hi there");
        resolve();
      };

      ws1.send(
        JSON.stringify({
          type: "chat",
          room: "Room 1",
          message: "Hi there",
        })
      );
    });
  });
});
