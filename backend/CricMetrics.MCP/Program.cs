using ModelContextProtocol.Server;
using Microsoft.Data.Sqlite;
using System.ComponentModel;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddMcpServer()
    .WithStdioServerTransport()
    .WithTools<IplTools>();

var app = builder.Build();
await app.RunAsync();

[McpServerToolType]
public class IplTools
{
    private readonly string _dbPath = "/Users/manideepkadarla/IPL Statistics/cricmetrics/backend/data/ipl.db";

    private SqliteConnection GetConnection()
    {
        var conn = new SqliteConnection($"Data Source={_dbPath}");
        conn.Open();
        return conn;
    }

    [McpServerTool, Description("Get top batsmen by runs scored")]
    public string GetTopBatsmen([Description("Number of players to return")] int limit = 10)
    {
        using var conn = GetConnection();
        var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT batsman, runs, fours, sixers FROM ipl_player_batting_stats ORDER BY runs DESC LIMIT {limit}";
        using var reader = cmd.ExecuteReader();
        var results = new List<string>();
        while (reader.Read())
            results.Add($"{reader["batsman"]}: {reader["runs"]} runs, {reader["fours"]} fours, {reader["sixers"]} sixes");
        return string.Join("\n", results);
    }

    [McpServerTool, Description("Get top bowlers by wickets taken")]
    public string GetTopBowlers([Description("Number of bowlers to return")] int limit = 10)
    {
        using var conn = GetConnection();
        var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT bowler, wickets_taken, runs_allowed FROM ipl_player_bowling_stats ORDER BY wickets_taken DESC LIMIT {limit}";
        using var reader = cmd.ExecuteReader();
        var results = new List<string>();
        while (reader.Read())
            results.Add($"{reader["bowler"]}: {reader["wickets_taken"]} wickets, {reader["runs_allowed"]} runs allowed");
        return string.Join("\n", results);
    }

    [McpServerTool, Description("Get points table for a season")]
    public string GetPointsTable([Description("IPL season year")] int season)
    {
        using var conn = GetConnection();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT rank, name, played, won, lost, points, nrr FROM points_table WHERE season = $season ORDER BY rank";
        cmd.Parameters.AddWithValue("$season", season);
        using var reader = cmd.ExecuteReader();
        var results = new List<string>();
        while (reader.Read())
            results.Add($"{reader["rank"]}. {reader["name"]} - {reader["points"]} pts, NRR: {reader["nrr"]}");
        return string.Join("\n", results);
    }

    [McpServerTool, Description("Get IPL season winner")]
    public string GetSeasonWinner([Description("IPL season year")] int season)
    {
        using var conn = GetConnection();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT winner, player_of_match FROM ipl_match_summary WHERE season = $season AND playoff = 'F'";
        cmd.Parameters.AddWithValue("$season", season);
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
            return $"IPL {season} Winner: {reader["winner"]}, Player of the Match: {reader["player_of_match"]}";
        return $"No final found for season {season}";
    }

    [McpServerTool, Description("Get team stats for a season")]
    public string GetTeamStats([Description("Team name")] string team, [Description("Season year")] int season)
    {
        using var conn = GetConnection();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT runs_scored, wickets_taken, runs_allowed FROM team_league_stats WHERE team = $team AND season = $season";
        cmd.Parameters.AddWithValue("$team", team);
        cmd.Parameters.AddWithValue("$season", season);
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
            return $"{team} in {season}: Runs scored: {reader["runs_scored"]}, Wickets taken: {reader["wickets_taken"]}, Runs allowed: {reader["runs_allowed"]}";
        return $"No stats found for {team} in {season}";
    }
}