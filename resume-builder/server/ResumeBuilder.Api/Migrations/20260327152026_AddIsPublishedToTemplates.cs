using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResumeBuilder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPublishedToTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Templates') AND name = 'IsPublished')
                BEGIN
                    ALTER TABLE [Templates] ADD [IsPublished] bit NOT NULL DEFAULT CAST(1 AS bit);
                END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
            name: "IsPublished",
            table: "Templates");
        }
    }
}
