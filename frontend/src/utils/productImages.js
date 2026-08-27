export const getRelevantProductImage = (product) => {
  if (!product) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }

  if (product.imageUrl) return product.imageUrl;
  if (product.productImageBase64) return `data:image/jpeg;base64,${product.productImageBase64}`;
  if (product.imageBytes) return `data:image/jpeg;base64,${product.imageBytes}`;
  if (product.imageData) return `data:image/jpeg;base64,${product.imageData}`;

  const name = (product.name || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();

  // --- ELECTRONICS ---
  if (name.includes("headphone") || name.includes("sony") || name.includes("wh-1000xm5")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("apple watch") || name.includes("series 9")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("samsung") || name.includes("qled") || name.includes("tv")) {
    return "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("bose") || name.includes("speaker") || name.includes("soundlink")) {
    return "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("macbook") || name.includes("laptop")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("logitech") || name.includes("mouse") || name.includes("mx master")) {
    return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80";
  }

  // --- FASHION ---
  if (name.includes("denim jacket") || name.includes("levi")) {
    return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("hoodie") || name.includes("puma")) {
    return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("oxford shirt") || name.includes("ralph lauren") || name.includes("shirt")) {
    return "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("chino") || name.includes("trousers") || name.includes("zara")) {
    return "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("ray-ban") || name.includes("sunglasses") || name.includes("wayfarer")) {
    return "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("belt") || name.includes("tommy hilfiger")) {
    return "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80";
  }

  // --- HOME ---
  if (name.includes("nespresso") || name.includes("coffee")) {
    return "https://images.unsplash.com/photo-1517668808822-9e428824603b?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("dyson v15") || name.includes("vacuum")) {
    return "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("philips") || name.includes("lamp") || name.includes("hue")) {
    return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("instant pot") || name.includes("cooker")) {
    return "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("sheet") || name.includes("bed") || name.includes("calvin klein")) {
    return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80";
  }

  // --- FOOTWEAR ---
  if (name.includes("air max") || name.includes("react")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("ultraboost") || name.includes("adidas ultraboost")) {
    return "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("jordan") || name.includes("basketball")) {
    return "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("clarks") || name.includes("desert boot") || name.includes("boot")) {
    return "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("rs-x") || name.includes("sneaker") || name.includes("shoes")) {
    return "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80";
  }

  // --- BEAUTY ---
  if (name.includes("dyson supersonic") || name.includes("hair dryer")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("estée lauder") || name.includes("serum")) {
    return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("m.a.c") || name.includes("lipstick")) {
    return "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("cerave") || name.includes("cleanser")) {
    return "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("kérastase") || name.includes("hair oil") || name.includes("oil")) {
    return "https://images.unsplash.com/photo-1608248597263-0057e57b4524?w=800&auto=format&fit=crop&q=80";
  }

  // --- SPORTS ---
  if (name.includes("yoga") || name.includes("mat")) {
    return "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("football") || name.includes("kipsta") || name.includes("ball")) {
    return "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("badminton") || name.includes("racket") || name.includes("yonex")) {
    return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("duffel") || name.includes("gym") || name.includes("under armour")) {
    return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80";
  }
  if (name.includes("dumbbell") || name.includes("bowflex") || name.includes("weight")) {
    return "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80";
  }

  // --- CATEGORY FALLBACKS ---
  if (cat.includes("electronics")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  }
  if (cat.includes("fashion")) {
    return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80";
  }
  if (cat.includes("home")) {
    return "https://images.unsplash.com/photo-1517668808822-9e428824603b?w=800&auto=format&fit=crop&q=80";
  }
  if (cat.includes("footwear")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80";
  }
  if (cat.includes("beauty")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80";
  }
  if (cat.includes("sports")) {
    return "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80";
  }

  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
};
