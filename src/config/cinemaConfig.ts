import type { CinemaConfig } from "@/types/cinemaConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

export const cinemaConfig: CinemaConfig = withUserConfig("cinema", {
	enable: true,
	title: "$t:cinema",
	description: "$t:cinemaBanner",
});
