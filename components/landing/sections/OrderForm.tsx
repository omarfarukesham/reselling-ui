"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { colorById, product, productImage, type ColorId } from "@/lib/product";
import { useOrderSelection } from "@/components/landing/OrderSelection";
import { fmt, isValidPhone, normalizePhone } from "@/lib/utils";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { fbEvent } from "@/lib/fpixel";

type Zone = "inside" | "outside";
type FieldName = "name" | "phone" | "address" | "email";
type Errors = Partial<Record<FieldName, string>> & { submit?: string };

const FIELD_ORDER: FieldName[] = ["name", "phone", "address"];

const inputBase =
  "block h-12 w-full rounded-xl border bg-white px-4 text-base text-neutral-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-4";
const inputOk =
  "border-slate-300 focus:border-brand-500 focus:ring-brand-500/15";
const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OrderForm() {
  const { colors } = product;
  const { color: initialColor, setColor: setGlobalColor } = useOrderSelection();

  // Multi-color selection: user can select 1, 2, or 3 colors
  const [selectedColors, setSelectedColors] = useState<ColorId[]>([
    initialColor,
  ]);
  const [qty, setQty] = useState(1);

  // Customer Information
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState<Zone>("inside");

  // State
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    totalPrice: number;
    userName: string;
    mobileNumber: string;
    colors: string[];
    qty: number;
  } | null>(null);

  const pricePerUnit = 390;
  const subtotal = pricePerUnit * qty;
  const deliveryCharge = zone === "inside" ? 80 : 120;
  const total = subtotal + deliveryCharge;

  // Toggle or add color
  function handleColorToggle(colorId: ColorId) {
    let updated: ColorId[];

    if (selectedColors.includes(colorId)) {
      // If only 1 color is selected, don't remove it (keep at least 1)
      if (selectedColors.length > 1) {
        updated = selectedColors.filter((c) => c !== colorId);
      } else {
        updated = selectedColors;
      }
    } else {
      // Add color (up to 3 colors)
      updated = [...selectedColors, colorId];
    }

    setSelectedColors(updated);
    // Quantity automatically matches the count of selected colors
    setQty(updated.length);
    // Update global preview color to latest chosen
    setGlobalColor(colorId);
  }

  // Handle manual quantity stepper
  function handleQtyChange(newQty: number) {
    if (newQty < 1 || newQty > 10) return;
    setQty(newQty);

    // If new quantity is greater than selected colors count, keep existing colors
    // If user reduces quantity below selected colors count, trim the selection
    if (newQty < selectedColors.length) {
      setSelectedColors(selectedColors.slice(0, newQty));
    }
  }

  // Phone number input handler: enforce Bangladesh 11 digits starting with 01, strip country code
  function handlePhoneChange(rawVal: string) {
    // Strip non-digits and BD country code prefix (+88 / 88)
    let digits = rawVal.replace(/\D/g, "");
    if (digits.startsWith("8801")) {
      digits = digits.slice(2);
    }
    // Limit to 11 digits
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setPhone(digits);
    if (errors.phone) clearError("phone");
  }

  function clearError(field: FieldName) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateForm(): Errors {
    const errs: Errors = {};
    if (name.trim().length < 2) {
      errs.name = "আপনার পুরো নাম লিখুন";
    }

    const cleanPhone = normalizePhone(phone);
    if (
      !cleanPhone ||
      cleanPhone.length !== 11 ||
      !cleanPhone.startsWith("01") ||
      !isValidPhone(cleanPhone)
    ) {
      errs.phone = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)";
    }

    if (address.trim().length < 8) {
      errs.address = "বাসা, এলাকা, থানা ও জেলা সহ পূর্ণ ঠিকানা দিন";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "সঠিক ইমেইল এড্রেস দিন";
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const foundErrors = validateForm();
    setErrors(foundErrors);

    const firstInvalid = FIELD_ORDER.find((f) => foundErrors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    // Build the final array of colors
    // If quantity is higher than unique selected colors, duplicate the chosen colors to match qty
    const colorNames = selectedColors.map((c) => colorById(c).name);
    const finalColorsArray: string[] = [];
    for (let i = 0; i < qty; i++) {
      finalColorsArray.push(colorNames[i % colorNames.length]);
    }

    const cleanPhone = normalizePhone(phone);
    const payload = {
      userName: name.trim(),
      mobileNumber: cleanPhone,
      email: email.trim() ? email.trim() : undefined,
      price: pricePerUnit,
      qty,
      productColors: finalColorsArray,
      deliveryArea: zone === "inside" ? "insideDhaka" : "outsideDhaka",
      deliveryAddress: address.trim(),
    };

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const res = await fetch(`${API_BASE_URL}/order/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.data) {
        throw new Error(
          body?.message ||
            "অর্ডার সম্পন্ন হতে পারেনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        );
      }

      setConfirmedOrder({
        orderId: body.data.orderId || body.data._id || "PO-SUCCESS",
        totalPrice: body.data.totalPrice || total,
        userName: payload.userName,
        mobileNumber: payload.mobileNumber,
        colors: finalColorsArray,
        qty,
      });

      // Track Facebook Pixel Purchase event
      fbEvent("Purchase", {
        value: body.data.totalPrice || total,
        currency: "BDT",
        content_name: product.name,
        num_items: qty,
      });

      requestAnimationFrame(() => {
        document
          .getElementById("order")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        submit:
          err instanceof Error
            ? err.message
            : "অর্ডার জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success view
  if (confirmedOrder) {
    return (
      <Section
        id="order"
        className="bg-cream py-14 sm:py-20"
        innerClassName="max-w-lg"
      >
        <div
          className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 sm:p-10"
          role="status"
        >
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </span>
          <h3 className="mt-5 text-2xl font-bold text-neutral-900">
            ধন্যবাদ, {confirmedOrder.userName}!
          </h3>
          <p className="mt-1 text-base text-slate-600">
            আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।
          </p>

          <div className="mt-4 inline-block rounded-xl bg-brand-50 border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800">
            অর্ডার আইডি:{" "}
            <span className="font-mono text-sm">{confirmedOrder.orderId}</span>
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-[15px]">
            <Row
              label="প্রোডাক্ট"
              value={`${product.nameBn} × ${confirmedOrder.qty}টি`}
            />
            <Row
              label="নির্বাচিত রং"
              value={confirmedOrder.colors.join(", ")}
            />
            <Row label="প্রতি পিস" value={`${fmt(pricePerUnit)}৳`} />
            <Row
              label="সর্বমোট বিল"
              value={`${fmt(confirmedOrder.totalPrice)}${product.currency}`}
              strong
            />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
            আমাদের প্রতিনিধি শীঘ্রই{" "}
            <span className="font-semibold text-neutral-900">
              {confirmedOrder.mobileNumber}
            </span>{" "}
            নম্বরে কল করে অর্ডার কনফার্ম করবেন।
          </p>

          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              setName("");
              setPhone("");
              setEmail("");
              setAddress("");
            }}
            className="mt-6 w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            নতুন অর্ডার করুন
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section id="order" className="bg-cream py-14 sm:py-20">
      <SectionTitle
        eyebrow="Order Now"
        title="অর্ডার করতে ফর্মটি পূরণ করুন"
        subtitle="ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন"
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-4 sm:space-y-5">
          {/* Step 1 — Color & Quantity (Size removed) */}
          <Card step="১" title="প্রোডাক্টের রং ও পরিমাণ বাছাই করুন">
            <Group label="পছন্দের রং সিলেক্ট করুন (একাধিক রং বেছে নিতে পারেন)">
              <div className="grid grid-cols-3 gap-2.5">
                {colors.map((c) => {
                  const isChecked = selectedColors.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorToggle(c.id)}
                      className={`relative flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-2.5 text-center transition-all ${
                        isChecked
                          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {isChecked && (
                        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                      <span className="relative mb-1 block h-14 w-14 overflow-hidden rounded-xl sm:h-16 sm:w-16">
                        <Image
                          src={productImage(c.id, "front")}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-sm font-bold">{c.nameBn}</span>
                      <span className="text-[11px] opacity-75">{c.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                💡 টিপস: আপনি ১টি, ২টি বা ৩টি রং একসাথে সিলেক্ট করতে পারবেন।
              </p>
            </Group>

            <Group label="মোট পরিমাণ (Quantity)">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-2xl border border-slate-300 bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1}
                    aria-label="পরিমাণ কমান"
                    className="grid h-12 w-12 place-items-center text-slate-700 hover:bg-slate-50 rounded-l-2xl disabled:text-slate-300 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span
                    className="w-12 text-center text-lg font-bold text-neutral-900"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={qty >= 10}
                    aria-label="পরিমাণ বাড়ান"
                    className="grid h-12 w-12 place-items-center text-slate-700 hover:bg-slate-50 rounded-r-2xl transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  <span>প্রতি পিস: </span>
                  <span className="font-bold text-brand-600">
                    {pricePerUnit}৳
                  </span>
                </div>
              </div>
            </Group>
          </Card>

          {/* Step 2 — Delivery Info */}
          <Card step="২" title="ডেলিভারি তথ্য দিন">
            <TextField id="name" label="আপনার নাম" error={errors.name}>
              <input
                id="name"
                name="name"
                autoComplete="name"
                enterKeyHint="next"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                placeholder="পুরো নাম"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              />
            </TextField>

            <TextField id="phone" label="মোবাইল নম্বর" error={errors.phone}>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  enterKeyHint="next"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`${inputBase} font-mono tracking-wider ${errors.phone ? inputErr : inputOk}`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400">
                  {phone.length}/11
                </span>
              </div>
            </TextField>

            {/* <TextField
              id="email"
              label="ইমেইল এড্রেস (ঐচ্ছিক)"
              error={errors.email}
            >
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                enterKeyHint="next"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                placeholder="yourname@example.com (ঐচ্ছিক)"
                className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
              />
            </TextField> */}

            <TextField
              id="address"
              label="সম্পূর্ণ ঠিকানা"
              error={errors.address}
            >
              <textarea
                id="address"
                name="address"
                autoComplete="street-address"
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearError("address");
                }}
                placeholder="বাসা/রোড নং, এলাকা, থানা ও জেলা"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
                className={`${inputBase} h-auto resize-none py-3 ${errors.address ? inputErr : inputOk}`}
              />
            </TextField>

            <Group label="ডেলিভারি এরিয়া">
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`flex min-h-12 cursor-pointer select-none items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition-colors ${
                    zone === "inside"
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="zone"
                    checked={zone === "inside"}
                    onChange={() => setZone("inside")}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-[15px] font-bold">
                      ঢাকার ভিতরে
                    </span>
                    <span className="block text-xs font-normal opacity-85">
                      চার্জ: ৮০৳
                    </span>
                  </div>
                </label>

                <label
                  className={`flex min-h-12 cursor-pointer select-none items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition-colors ${
                    zone === "outside"
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="zone"
                    checked={zone === "outside"}
                    onChange={() => setZone("outside")}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-[15px] font-bold">
                      ঢাকার বাইরে
                    </span>
                    <span className="block text-xs font-normal opacity-85">
                      চার্জ: ১২০৳
                    </span>
                  </div>
                </label>
              </div>
            </Group>
          </Card>
        </div>

        {/* Summary + Submit (Sticky beside form on desktop) */}
        <aside className="lg:sticky lg:top-24">
          <Card title="অর্ডার সামারি">
            <div className="space-y-3 text-[15px]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-xs">
                  <Image
                    src={productImage(selectedColors[0] || "red", "baby")}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-neutral-900">
                    {product.nameBn}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    রং:{" "}
                    {selectedColors.map((c) => colorById(c).nameBn).join(", ")}
                  </p>
                  <p className="text-xs font-semibold text-brand-600">
                    পরিমাণ: {qty}টি ({pricePerUnit}৳ × {qty})
                  </p>
                </div>
              </div>

              <Row
                label="পণ্যের মূল্য"
                value={`${fmt(subtotal)}${product.currency}`}
              />
              <Row
                label="ডেলিভারি চার্জ"
                value={`${fmt(deliveryCharge)}${product.currency}`}
              />

              <div className="border-t border-dashed border-slate-200 pt-3">
                <Row
                  label="সর্বমোট বিল"
                  value={`${fmt(total)}${product.currency}`}
                  strong
                />
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>অর্ডার প্রসেস হচ্ছে…</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  <span>অর্ডার কনফার্ম করুন</span>
                </>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4" />
              অগ্রিম টাকা লাগবে না — হাতে পেয়ে পরিশোধ
            </p>
          </Card>
        </aside>
      </form>
    </Section>
  );
}

function Card({
  step,
  title,
  children,
}: {
  step?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
      <h3 className="flex items-center gap-2.5 text-lg font-bold text-neutral-900">
        {step && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-sm text-white font-bold">
            {step}
          </span>
        )}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[15px] font-semibold text-slate-800">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function TextField({
  id,
  label,
  error,
  children,
}: {
  id: FieldName;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[15px] font-semibold text-slate-800"
      >
        {label} {id !== "email" && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${strong ? "text-lg font-bold text-neutral-900" : "text-slate-600"}`}
    >
      <span>{label}</span>
      <span
        className={`shrink-0 ${strong ? "text-brand-600 font-extrabold text-xl" : "font-medium text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
