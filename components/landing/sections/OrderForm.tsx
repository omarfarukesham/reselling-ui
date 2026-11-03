"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Truck,
} from "lucide-react";
import {
  colorById,
  comboFor,
  product,
  productImage,
  regularPrice,
} from "@/lib/product";
import { useOrderSelection } from "@/components/landing/OrderSelection";
import { fmt, isValidPhone, normalizePhone } from "@/lib/utils";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { fbEvent } from "@/lib/fpixel";

type Zone = "inside" | "outside";
type FieldName = "name" | "phone" | "address" | "email";
type Errors = Partial<Record<FieldName, string>> & { submit?: string };

const FIELD_ORDER: FieldName[] = ["name", "phone", "address"];
const PIECE_LABEL = ["১ম", "২য়", "৩য়"];

const inputBase =
  "block h-12 w-full rounded-xl border bg-white px-4 text-base text-neutral-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-4";
const inputOk =
  "border-slate-300 focus:border-brand-500 focus:ring-brand-500/15";
const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OrderForm() {
  const { colors, combos, currency, delivery } = product;
  const { qty, setQty, pieces, setPieceColor } = useOrderSelection();

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
    freeDelivery: boolean;
  } | null>(null);

  // ── Pricing (combo) ──
  const combo = comboFor(qty);
  const subtotal = combo.price;
  const zoneCharge = delivery[zone].charge;
  const deliveryCharge = combo.freeDelivery ? 0 : zoneCharge;
  const total = subtotal + deliveryCharge;
  const saved = regularPrice(qty) - subtotal + (combo.freeDelivery ? zoneCharge : 0);

  // Phone number input handler: enforce Bangladesh 11 digits starting with 01, strip country code
  function handlePhoneChange(rawVal: string) {
    let digits = rawVal.replace(/\D/g, "");
    if (digits.startsWith("8801")) {
      digits = digits.slice(2);
    }
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
      errs.name = "আপনার নামটা লিখুন";
    }

    const cleanPhone = normalizePhone(phone);
    if (
      !cleanPhone ||
      cleanPhone.length !== 11 ||
      !cleanPhone.startsWith("01") ||
      !isValidPhone(cleanPhone)
    ) {
      errs.phone = "১১ সংখ্যার মোবাইল নম্বরটা দিন (যেমন: 01712345678)";
    }

    if (address.trim().length < 8) {
      errs.address = "ঠিকানাটা একটু বিস্তারিত লিখুন: বাসা, এলাকা, থানা আর জেলা";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "ইমেইলটা ঠিকমতো লিখুন";
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

    // One colour per piece, e.g. ["Red", "Blue", "Brown"]
    const pieceColors = pieces.map((c) => colorById(c).name);

    // Server computes totalPrice = price × qty + deliveryCharged,
    // so send the combo's per-piece price and 0 delivery for free-delivery combos.
    const cleanPhone = normalizePhone(phone);
    const payload = {
      userName: name.trim(),
      mobileNumber: cleanPhone,
      email: email.trim() ? email.trim() : undefined,
      price: subtotal / qty,
      qty,
      productColors: pieceColors,
      deliveryArea: zone === "inside" ? "insideDhaka" : "outsideDhaka",
      deliveryCharged: deliveryCharge,
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
            "অর্ডারটা জমা হয়নি। একটু পরে আবার চেষ্টা করুন, অথবা আমাদের কল দিন।",
        );
      }

      setConfirmedOrder({
        orderId: body.data.orderId || body.data._id || "PO-SUCCESS",
        totalPrice: body.data.totalPrice || total,
        userName: payload.userName,
        mobileNumber: payload.mobileNumber,
        colors: pieceColors,
        qty,
        freeDelivery: combo.freeDelivery,
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
            : "অর্ডার জমা দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।",
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
            আপনার অর্ডারটা আমরা পেয়ে গেছি।
          </p>

          <div className="mt-4 inline-block rounded-xl bg-brand-50 border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800">
            অর্ডার আইডি:{" "}
            <span className="font-mono text-sm">{confirmedOrder.orderId}</span>
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-[15px]">
            <Row
              label="প্রোডাক্ট"
              value={`${product.nameBn} × ${confirmedOrder.qty}টা`}
            />
            <Row label="রং" value={confirmedOrder.colors.join(", ")} />
            <Row
              label="ডেলিভারি"
              value={confirmedOrder.freeDelivery ? "ফ্রি" : "চার্জ সহ"}
            />
            <Row
              label="মোট দিতে হবে"
              value={`${fmt(confirmedOrder.totalPrice)}${currency}`}
              strong
            />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
            কিছুক্ষণের মধ্যেই আমাদের একজন{" "}
            <span className="font-semibold text-neutral-900">
              {confirmedOrder.mobileNumber}
            </span>{" "}
            নম্বরে কল দিয়ে অর্ডারটা কনফার্ম করবেন। ফোনটা কাছে রাখবেন।
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
            আরেকটা অর্ডার করুন
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section id="order" className="bg-gradient-to-b from-brand-50 to-brand-100/60 py-14 sm:py-20">
      <SectionTitle
        eyebrow="Order Now"
        title="অর্ডার করতে নিচের তথ্যগুলো দিন"
        subtitle="আগে কোনো টাকা দিতে হবে না, পণ্য হাতে পেয়ে দাম দিবেন"
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-4 sm:space-y-5">
          {/* Step 1 — Combo & colours */}
          <Card step="১" title="কয়টা নিবেন?">
            <div
              role="radiogroup"
              aria-label="কয়টা নিবেন"
              className="grid grid-cols-3 gap-2.5"
            >
              {combos.map((c) => {
                const active = qty === c.qty;
                return (
                  <button
                    key={c.qty}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setQty(c.qty)}
                    className={`relative flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 px-1.5 pb-2.5 pt-4 text-center transition-all ${
                      active
                        ? "border-brand-500 bg-brand-50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {c.freeDelivery && (
                      <span className="absolute -top-2.5 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
                        ডেলিভারি ফ্রি
                      </span>
                    )}
                    <span
                      className={`text-lg font-bold ${active ? "text-brand-700" : "text-neutral-900"}`}
                    >
                      {c.title}
                    </span>
                    <span className="text-base font-extrabold text-brand-600">
                      {fmt(c.price)}
                      {currency}
                    </span>
                    {regularPrice(c.qty) > c.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {fmt(regularPrice(c.qty))}
                        {currency}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Group
              label={qty > 1 ? "প্রতিটার রং বেছে নিন" : "রং বেছে নিন"}
            >
              <div className="space-y-3">
                {pieces.map((pieceColor, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {qty > 1 && (
                      <span className="w-8 shrink-0 text-sm font-semibold text-slate-600">
                        {PIECE_LABEL[i]}
                      </span>
                    )}
                    <div
                      role="radiogroup"
                      aria-label={`${PIECE_LABEL[i]} পিসের রং`}
                      className="grid flex-1 grid-cols-3 gap-2"
                    >
                      {colors.map((c) => {
                        const active = pieceColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setPieceColor(i, c.id)}
                            className={`relative flex items-center gap-2 rounded-xl border-2 p-1.5 pr-2 text-left transition-all ${
                              active
                                ? "border-brand-500 bg-brand-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={productImage(c.id, "baby")}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </span>
                            <span
                              className={`text-sm font-bold ${active ? "text-brand-700" : "text-slate-700"}`}
                            >
                              {c.name}
                            </span>
                            {active && (
                              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                চাইলে একই রঙের একাধিক নিতে পারেন। ৩টার বেশি লাগলে আমাদের কল দিন।
              </p>
            </Group>
          </Card>

          {/* Step 2 — Delivery Info */}
          <Card step="২" title="কোথায় পাঠাবো?">
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
                placeholder="যেমন: রাবেয়া খাতুন"
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

            <TextField
              id="address"
              label="পুরো ঠিকানা"
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
                placeholder="যেমন: বাসা ১২, রোড ৫, মিরপুর ১০, ঢাকা"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
                className={`${inputBase} h-auto resize-none py-3 ${errors.address ? inputErr : inputOk}`}
              />
            </TextField>

            <Group label="কোন এলাকায় থাকেন?">
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(delivery) as Zone[]).map((z) => (
                  <label
                    key={z}
                    className={`flex min-h-12 cursor-pointer select-none items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition-colors ${
                      zone === z
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="zone"
                      checked={zone === z}
                      onChange={() => setZone(z)}
                      className="sr-only"
                    />
                    <div>
                      <span className="block text-[15px] font-bold">
                        {delivery[z].label}
                      </span>
                      <span className="block text-xs font-normal opacity-85">
                        {combo.freeDelivery ? (
                          <>
                            <span className="line-through">
                              {delivery[z].charge}৳
                            </span>{" "}
                            <span className="font-semibold text-emerald-700">
                              ফ্রি
                            </span>
                          </>
                        ) : (
                          <>চার্জ {delivery[z].charge}৳</>
                        )}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </Group>
          </Card>
        </div>

        {/* Summary + Submit (Sticky beside form on desktop) */}
        <aside className="lg:sticky lg:top-24">
          <Card title="আপনার অর্ডার">
            <div className="space-y-3 text-[15px]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex shrink-0 -space-x-4">
                  {pieces.map((c, i) => (
                    <span
                      key={i}
                      className="relative h-14 w-14 overflow-hidden rounded-xl bg-white shadow-xs ring-2 ring-slate-50"
                    >
                      <Image
                        src={productImage(c, "baby")}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-neutral-900">
                    {product.nameBn}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {qty}টা · {pieces.map((c) => colorById(c).name).join(", ")}
                  </p>
                </div>
              </div>

              <Row
                label={`দাম (${qty}টা)`}
                value={`${fmt(subtotal)}${currency}`}
              />
              <Row
                label="ডেলিভারি চার্জ"
                value={
                  combo.freeDelivery ? "ফ্রি" : `${fmt(deliveryCharge)}${currency}`
                }
              />

              <div className="border-t border-dashed border-slate-200 pt-3">
                <Row
                  label="মোট দিতে হবে"
                  value={`${fmt(total)}${currency}`}
                  strong
                />
              </div>

              {saved > 0 ? (
                <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <Truck className="h-4 w-4 shrink-0" />
                  এই কম্বোতে আপনার {fmt(saved)}৳ বাঁচছে
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setQty(2)}
                  className="w-full rounded-xl bg-amber-50 px-3 py-2 text-left text-sm font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  আরেকটা যোগ করলেই ডেলিভারি চার্জ লাগবে না।{" "}
                  <span className="font-bold underline">২টা নিন</span>
                </button>
              )}
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
                  <span>একটু অপেক্ষা করুন…</span>
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
              আগে টাকা লাগবে না, হাতে পেয়ে দাম দিবেন
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
