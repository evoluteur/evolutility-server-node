import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeShutdown } from "../../scripts/utils/shutdown.ts";

const setup = (closeDelay = 0, timeoutMs = 1000) => {
  const steps: string[] = [];
  const server = {
    close(cb: () => void) {
      steps.push("close server");
      setTimeout(cb, closeDelay); // - requests in progress
    },
    closeIdleConnections() {
      steps.push("close idle");
    },
  };
  const shutdown = makeShutdown({
    server,
    closeDb: () => {
      steps.push("close db");
    },
    timeoutMs,
    exit: (code) => steps.push("exit " + code),
    log: { info: () => {}, error: () => {} },
  });
  return { steps, shutdown };
};

describe("shutdown", () => {
  it("closes the server, then the database, then exits", async () => {
    const { steps, shutdown } = setup(20);
    await shutdown("SIGTERM");
    assert.deepEqual(steps, ["close server", "close idle", "close db", "exit 0"]);
  });

  it("exits w/ code 1 after a crash", async () => {
    const { steps, shutdown } = setup();
    await shutdown("Uncaught exception", 1);
    assert.equal(steps.at(-1), "exit 1");
  });

  it("exits right away on a 2nd signal", async () => {
    const { steps, shutdown } = setup(50);
    const first = shutdown("SIGINT");
    await shutdown("SIGINT");
    assert.deepEqual(steps, ["close server", "close idle", "exit 1"]);
    await first;
  });

  it("forces the exit if requests take too long", async () => {
    const { steps, shutdown } = setup(200, 30);
    await shutdown("SIGTERM");
    assert.equal(steps.includes("exit 1"), true); // - forced by the timeout
    assert.ok(steps.indexOf("exit 1") < steps.indexOf("close db"));
  });

  it("still exits if closing the database fails", async () => {
    const exits: number[] = [];
    const shutdown = makeShutdown({
      server: { close: (cb?: () => void) => cb?.() },
      closeDb: () => {
        throw new Error("boom");
      },
      exit: (code) => exits.push(code),
      log: { info: () => {}, error: () => {} },
    });
    await shutdown("SIGTERM");
    assert.deepEqual(exits, [0]);
  });
});
