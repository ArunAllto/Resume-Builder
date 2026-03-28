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
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Order> Orders => Set<Order>();

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
            entity.Property(e => e.IsFree).HasMaxLength(50);
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

        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.Property(e => e.SiteName).HasMaxLength(255);
            entity.Property(e => e.Tagline).HasMaxLength(500);
            entity.Property(e => e.HeroTitle).HasMaxLength(500);
            entity.Property(e => e.HeroSubtitle).HasMaxLength(1000);
            entity.Property(e => e.PrimaryColor).HasMaxLength(50);
            entity.Property(e => e.LogoUrl).HasMaxLength(1000);
            entity.Property(e => e.ContactEmail).HasMaxLength(255);
            entity.Property(e => e.ContactPhone).HasMaxLength(50);
            entity.Property(e => e.Address).HasMaxLength(1000);
            entity.Property(e => e.SocialLinks).HasColumnType("nvarchar(max)");
            entity.Property(e => e.FooterText).HasMaxLength(1000);
            entity.Property(e => e.AnnouncementText).HasMaxLength(1000);
            entity.Property(e => e.AnnouncementColor).HasMaxLength(50);
            entity.Property(e => e.AnnouncementLink).HasMaxLength(1000);
        });

        modelBuilder.Entity<Testimonial>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(255);
            entity.Property(e => e.Company).HasMaxLength(255);
            entity.Property(e => e.Content).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(e => e.AvatarUrl).HasMaxLength(1000);
        });

        modelBuilder.Entity<ContactSubmission>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Message).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.Property(e => e.Code).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.DiscountType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.DiscountValue).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(e => e.Id).HasMaxLength(36);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.OrderNumber).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(36).IsRequired();
            entity.Property(e => e.TemplateId).HasMaxLength(36).IsRequired();
            entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.FinalAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.PaymentGateway).HasMaxLength(20);
            entity.Property(e => e.GatewayOrderId).HasMaxLength(255);
            entity.Property(e => e.GatewayPaymentId).HasMaxLength(255);
            entity.Property(e => e.GatewaySignature).HasMaxLength(500);
            entity.Property(e => e.CouponCode).HasMaxLength(100);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Template)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.TemplateId, e.Status });
        });
    }
}
