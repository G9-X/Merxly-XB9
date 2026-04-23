using merxly.Domain.Entities;
using merxly.Domain.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace merxly.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<Address> Addresses { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistory { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
        public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<ProductVariantAttributeValue> ProductVariantAttributeValues { get; set; }
        public DbSet<ProductVariantMedia> ProductVariantMedia { get; set; }
        public DbSet<Refund> Refunds { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewMedia> ReviewMedia { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<StoreAddress> StoreAddresses { get; set; }
        public DbSet<StoreTransfer> StoreTransfers { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<SubOrder> SubOrders { get; set; }
        public DbSet<ChatThread> ChatThreads { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all entity configurations from the assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Configure Identity table names
            modelBuilder.Entity<ApplicationUser>().ToTable("Users");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("Roles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var createdEntries = ChangeTracker.Entries<ICreatedDate>()
                .Where(e => e.State == EntityState.Added);

            foreach (var entry in createdEntries)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            var modifiedEntries = ChangeTracker.Entries<IModifiedDate>()
                .Where(e => e.State == EntityState.Modified);

            foreach (var entry in modifiedEntries)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
