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
            migrationBuilder.AddColumn<bool>(
               name: "IsPublished",
               table: "Templates",
               type: "bit",
               nullable: false,
               defaultValue: true);
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
