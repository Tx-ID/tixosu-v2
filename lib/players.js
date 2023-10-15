import { getPlayersById } from "./osu";
import turso from "./turso";

export async function getRegisteredPlayers() {
    const db = turso();

    const result = await db.execute("SELECT osu_id FROM participant");

    const ids = result.rows.map((e) => e.osu_id);

    const players = await getPlayersById(...ids);

    return players;
}