"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import type { SingleProduct } from "@/lib/landings/types";
import { fmt, isValidPhone, normalizePhone } from "@/lib/utils";
import { fbEvent } from "@/lib/fpixel";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { useSingleSelection } from "./Selection";

type Zone = "inside" | "outside";
type FieldName = "name" | "phone" | "address";
type Errors = Partial<Record<FieldName, string>> & { submit?: string };

const FIELD_ORDER: FieldName[] = ["name", "phone", "address"];

const inputBase =
  "block h-12 w-full rounded-xl border bg-white px-4 text-base text-neutral-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-4";
const inputOk = "border-slate-300 focus:border-brand-500 focus:ring-brand-500/15";
const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Single-product order form (no combos). Posts to the same /order/create-order API
// as the main landing page.
export default function OrderForm({ p }: { p: SingleProduct }) {
  const { colorId, setColorId, qty, setQty } = useSingleSelection();
  const color = p.colors.find((c) => c.id === colorId) ?? p.colors[0];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState<Zone>("inside");

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    orderId: string;
    totalPrice: number;
    userName: string;
    mobileNumber: string;
    color: string;
    qty: number;
  } | null>(null);

  const subtotal = p.price * qty;
  const deliveryCharge = p.freeDelivery ? 0 : p.delivery[zone].charge;
  const total = subtotal + deliveryCharge;

  function clearError(field: FieldName) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handlePhoneChange(raw: string) {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("8801")) digits = digits.slice(2);
    setPhone(digits.slice(0, 11));
    clearError("phone");
  }

  function validate(): Errors {
    const errs: Errors = {};
    if (name.trim().length < 2) errs.name = "আপনার নামটা লিখুন";
    if (!isValidPhone(phone)) errs.phone = "১১ সংখ্যার মোবাইল নম্বরটা দিন (যেমন: 01712345678)";
    if (address.trim().length < 8) errs.address = "ঠিকানাটা একটু বিস্তারিত লিখুন: বাসা, এলাকা, থানা আর জেলা";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((f) => found[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    // Server computes totalPrice = price × qty + deliveryCharged
    const payload = {
      userName: name.trim(),
      mobileNumber: normalizePhone(phone),
      price: p.price,
      qty,
      productColors: Array.from({ length: qty }, () => color.name),
      deliveryArea: zone === "inside" ? "insideDhaka" : "outsideDhaka",
      deliveryCharged: deliveryCharge,
      deliveryAddress: address.trim(),
    };

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const res = await fetch(`${API_BASE_URL}/order/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.data) {
        throw new Error(body?.message || "অর্ডারটা জমা হয়নি। একটু পরে আবার চেষ্টা করুন, অথবা আমাদের কল দিন।");
      }

      setConfirmed({
        orderId: body.data.orderId || body.data._id || "PO-SUCCESS",
        totalPrice: body.data.totalPrice || total,
        userName: payload.userName,
        mobileNumber: payload.mobileNumber,
        color: color.name,
        qty,
      });

      fbEvent("Purchase", {
        value: body.data.totalPrice || total,
        currency: "BDT",
        content_name: p.name,
        num_items: qty,
      });

      requestAnimationFrame(() =>
        document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        submit: err instanceof Error ? err.message : "অর্ডার জমা দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <Section id="order" className="bg-gradient-to-b from-brand-50 to-brand-100/60 py-14 sm:py-20" innerClassName="max-w-lg">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 sm:p-10" role="status">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </span>
          <h3 className="mt-5 text-2xl font-bold text-neutral-900">ধন্যবাদ, {confirmed.userName}!</h3>
          <p className="mt-1 text-base text-slate-600">আপনার অর্ডারটা আমরা পেয়ে গেছি।</p>

          <div className="mt-4 inline-block rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-800">
            অর্ডার আইডি: <span className="font-mono text-sm">{confirmed.orderId}</span>
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-[15px]">
            <Row label="প্রোডাক্ট" value={`${p.shortName} × ${confirmed.qty}টা`} />
            <Row label="রং" value={confirmed.color} />
            <Row label="ডেলিভারি" value={p.freeDelivery ? "ফ্রি" : "চার্জ সহ"} />
            <Row label="মোট দিতে হবে" value={`${fmt(confirmed.totalPrice)}${p.currency}`} strong />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
            কিছুক্ষণের মধ্যেই আমাদের একজন{" "}
            <span className="font-semibold text-neutral-900">{confirmed.mobileNumber}</span> নম্বরে কল দিয়ে
            অর্ডারটা কনফার্ম করবেন। ফোনটা কাছে রাখবেন।
          </p>

          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              setName("");
              setPhone("");
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

      <form noValidate onSubmit={handleSubmit} className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-4 sm:space-y-5">
          {/* Step 1 — colour & quantity */}
          <Card step="১" title="রং আর পরিমাণ বেছে নিন">
            <Group label="রং">
              <div role="radiogroup" aria-label="রং" className="grid grid-cols-2 gap-2.5">
                {p.colors.map((c) => {
                  const active = colorId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setColorId(c.id)}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 p-2 pr-3 text-left transition-all ${
                        active ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className={`text-sm font-bold ${active ? "text-brand-700" : "text-slate-700"}`}>{c.name}</span>
                      {active && (
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Group>

            <Group label="কয়টা নিবেন?">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-2xl border border-slate-300 bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    aria-label="পরিমাণ কমান"
                    className="grid h-12 w-12 place-items-center rounded-l-2xl text-slate-700 transition-colors hover:bg-slate-50 disabled:text-slate-300"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-neutral-900" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(p.maxQty, qty + 1))}
                    disabled={qty >= p.maxQty}
                    aria-label="পরিমাণ বাড়ান"
                    className="grid h-12 w-12 place-items-center rounded-r-2xl text-slate-700 transition-colors hover:bg-slate-50 disabled:text-slate-300"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-slate-600">
                  প্রতিটা <span className="font-bold text-brand-600">{fmt(p.price)}৳</span>
                </span>
              </div>
            </Group>
          </Card>

          {/* Step 2 — delivery info */}
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
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-slate-400">
                  {phone.length}/11
                </span>
              </div>
            </TextField>

            <TextField id="address" label="পুরো ঠিকানা" error={errors.address}>
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
                {(Object.keys(p.delivery) as Zone[]).map((z) => (
                  <label
                    key={z}
                    className={`flex min-h-12 cursor-pointer select-none items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition-colors ${
                      zone === z
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" name="zone" checked={zone === z} onChange={() => setZone(z)} className="sr-only" />
                    <div>
                      <span className="block text-[15px] font-bold">{p.delivery[z].label}</span>
                      <span className="block text-xs font-normal opacity-85">
                        {p.freeDelivery ? (
                          <span className="font-semibold text-emerald-700">ডেলিভারি ফ্রি</span>
                        ) : (
                          <>চার্জ {p.delivery[z].charge}৳</>
                        )}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </Group>
          </Card>
        </div>

        {/* Summary + submit */}
        <aside className="lg:sticky lg:top-24">
          <Card title="আপনার অর্ডার">
            <div className="space-y-3 text-[15px]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-xs">
                  <Image src={color.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-neutral-900">{p.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {qty}টা · {color.name}
                  </p>
                </div>
              </div>

              <Row label={`দাম (${qty}টা)`} value={`${fmt(subtotal)}${p.currency}`} />
              <Row label="ডেলিভারি চার্জ" value={p.freeDelivery ? "ফ্রি" : `${fmt(deliveryCharge)}${p.currency}`} />

              <div className="border-t border-dashed border-slate-200 pt-3">
                <Row label="মোট দিতে হবে" value={`${fmt(total)}${p.currency}`} strong />
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] disabled:opacity-70"
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

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              আগে টাকা লাগবে না, হাতে পেয়ে দাম দিবেন
            </p>
          </Card>
        </aside>
      </form>
    </Section>
  );
}

function Card({ step, title, children }: { step?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
      <h3 className="flex items-center gap-2.5 text-lg font-bold text-neutral-900">
        {step && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {step}
          </span>
        )}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[15px] font-semibold text-slate-800">{label}</legend>
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
      <label htmlFor={id} className="mb-2 block text-[15px] font-semibold text-slate-800">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${strong ? "text-lg font-bold text-neutral-900" : "text-slate-600"}`}
    >
      <span>{label}</span>
      <span className={`shrink-0 ${strong ? "text-xl font-extrabold text-brand-600" : "font-medium text-neutral-900"}`}>
        {value}
      </span>
    </div>
  );
}
