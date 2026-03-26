using Microsoft.EntityFrameworkCore;
using ResumeBuilder.Api.Models;

namespace ResumeBuilder.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPurchase> UserPurchases => Set<UserPurchase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Template>(entity =>
        {
            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Thumbnail).HasColumnType("nvarchar(max)");
            entity.Property(e => e.LayoutConfig).HasColumnType("nvarchar(max)");
            entity.Property(e => e.OriginalPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.OfferPrice).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Resume>(entity =>
        {
            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.TemplateId).HasMaxLength(36).IsRequired();
            entity.Property(e => e.Data).HasColumnType("nvarchar(max)");
            entity.Property(e => e.SessionId).HasMaxLength(255);
            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(e => e.Template)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Id).HasMaxLength(36);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.HasIndex(e => e.GoogleId)
                  .IsUnique()
                  .HasFilter("[GoogleId] IS NOT NULL");
        });

        modelBuilder.Entity<UserPurchase>(entity =>
        {
            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.UserId).HasMaxLength(36).IsRequired();
            entity.Property(e => e.TemplateId).HasMaxLength(36).IsRequired();
            entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");

            entity.HasIndex(e => new { e.UserId, e.TemplateId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Template)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
