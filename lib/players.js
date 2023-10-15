import { getTursoClient } from "./db";
import { getPlayersById } from "./osu";

export async function getRegisteredPlayers() {
    const db = await getTursoClient();

    const result = await db.execute("SELECT osu_id FROM participant");

    const ids = result.rows.map((e) => e.osu_id);

    const players = await getPlayersById(...ids);

    return players;
}