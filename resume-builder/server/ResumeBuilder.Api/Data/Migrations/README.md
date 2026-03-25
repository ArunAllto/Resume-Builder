# Database Migrations

## IsPublished Field (Template)

The `IsPublished` boolean field has been added to the `Template` model.

### For Development

The app uses `EnsureCreated()` in `DbSeeder`, so simply restarting the app will pick up the new column for fresh databases. If you have an existing database, you may need to either:

1. Drop and recreate the database, or
2. Run a migration (see below)

### Using EF Core Migrations

```bash
cd server/ResumeBuilder.Api
dotnet ef migrations add AddIsPublished
dotnet ef database update
```

### Manual SQL (if needed)

```sql
ALTER TABLE Templates ADD COLUMN IsPublished tinyint(1) NOT NULL DEFAULT 0;
UPDATE Templates SET IsPublished = 1 WHERE IsActive = 1;
```
