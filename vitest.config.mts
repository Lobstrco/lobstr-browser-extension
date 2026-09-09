import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "unit",
                    environment: "jsdom",
                    include: ["src/**/__tests__/**/*.test.{js,ts}"],
                },
            },
            {
                // requires the built files the way a Node consumer does; `pretest` builds first
                test: {
                    name: "node",
                    environment: "node",
                    include: ["tests/**/*.test.js"],
                },
            },
        ],
    },
});
