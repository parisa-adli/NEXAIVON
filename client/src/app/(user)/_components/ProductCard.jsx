import Image from "next/image";
import Link from "next/link";
import { LuStar } from "react-icons/lu";
import AddToCart from "../products/[slug]/AddToCart";
import LikeProduct from "../products/LikeProduct";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "@/utils/toPersianNumber";

function ProductCard({ product, showRating = true, showLike = false }) {
  const hasDiscount = product.discount > 0;
  const isBestseller = product.likesCount > 2;

  return (
    <article className="relative flex flex-col rounded-xl border border-secondary-200 bg-secondary-0 overflow-hidden">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[1.6] bg-secondary-100"
      >
        <Image
          src={product.imageLink}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain p-4"
        />
        {(hasDiscount || isBestseller) && (
          <span
            className={`absolute top-3 right-3 rounded px-2 py-0.5 text-xs text-white ${
              hasDiscount ? "bg-badge-off" : "bg-badge-best"
            }`}
          >
            {hasDiscount ? "تخفیف" : "پرفروش"}
          </span>
        )}
      </Link>
      {showLike && (
        <div className="absolute top-2 left-2">
          <LikeProduct product={product} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-y-3 p-4">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-secondary-900 line-clamp-2"
        >
          {product.title}
        </Link>
        {showRating && (
          <div className="flex items-center gap-x-1 text-xs text-secondary-500">
            <span className="flex" aria-label={`امتیاز ${product.rating} از ۵`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <LuStar
                  key={n}
                  aria-hidden
                  className={`w-3.5 h-3.5 ${
                    n <= Math.round(product.rating)
                      ? "fill-star text-star"
                      : "text-secondary-300"
                  }`}
                />
              ))}
            </span>
            <span>({toPersianNumbers(product.numReviews)})</span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            {hasDiscount && (
              <del className="block text-xs text-secondary-400">
                {toPersianNumbersWithComma(product.price)}
              </del>
            )}
            <span className="text-sm font-bold text-secondary-900">
              {toPersianNumbersWithComma(product.offPrice)} تومان
            </span>
          </div>
          <AddToCart product={product} compact />
        </div>
      </div>
    </article>
  );
}
export default ProductCard;
