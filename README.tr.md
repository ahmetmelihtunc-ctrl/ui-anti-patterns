# UI Anti-Patterns Skill (Türkçe özet)

Bu depo, arayüzlerin "yapay zekâ üretmiş gibi" görünmesine yol açan alışkanlıkları bulan, düzeltmeye yardım eden ve sonraki geliştirmelerde geri dönmesini engelleyen bir Claude Code skill'i ve bağımsız bir linter içerir.

İngilizce ana sayfa (`README.md`) bilerek bir parodidir. Yapay zekâ ile üretilmiş README'leri taklit eder ve linterin kendisi o dosyayı işaretler. Gerçek dokümantasyon `docs/README.md` dosyasındadır.

## İçerik

- `skills/ui-anti-patterns`, üç moduyla skill. CHECK sorunları raporlar, FIX düzeltir, GUARD gerilemeleri önler.
- `scripts/ui-slop-lint.mjs`, Node 18 ve üzeri için bağımlılıksız linter. 44 kural içerir (renk, tipografi, bileşenler, hareket, metin ve noktalama).
- `hooks/`, Claude Code PostToolUse kancası, git pre-commit betiği, GitHub Action örneği ve test koruması.
- `evals/`, etiketli tespit külliyatı, tetikleme sorguları ve görev değerlendirmeleri.

## Hızlı kullanım

```
mkdir -p ~/.claude/skills
cp -R skills/ui-anti-patterns ~/.claude/skills/ui-anti-patterns
node ~/.claude/skills/ui-anti-patterns/scripts/ui-slop-lint.mjs src
```

## Önemli kavramlar

- Önem düzeyi P0, P1 ve P2. Varsayılan olarak P0 ve P1 çalışmayı başarısız kılar.
- Baseline dosyası mevcut bulguları kaydeder. Yalnızca yeni bulgular hata verir.
- Meşru kullanımlar yerinde bir yorumla işaretlenir ve bir gerekçe zorunludur. Örnek: `ui-slop-ignore left-border-accent: uyarı önem düzeyini gösterir`.
- `--fix-safe` yalnızca metin düğümlerinde iki mekanik düzeltme yapar. Varsayılan olarak deneme çalıştırmasıdır, `--write` ile uygulanır.

## Sınırlar

Linter metni okur, sayfayı çizmez. Bu yüzden kompozisyonu ve görsel üzerindeki kontrastı değerlendiremez. P2 kuralları sezgiseldir. Doğruluk ölçümleri ve ölçülmeyenler `docs/QUALITY.md` dosyasındadır.

## Lisans ve atıf

Apache License 2.0. Çekirdek kural listesi, Apache-2.0 lisanslı open-design projesinden uyarlanmış ve özetlenmiştir. Ayrıntılar `NOTICE` dosyasındadır.
