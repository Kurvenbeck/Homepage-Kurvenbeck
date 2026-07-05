"use client";

import { useState, useTransition } from "react";
import {
  IconCheck,
  IconRotate,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import type { BackstubeOrder } from "@/lib/backstubeOrders";
import { setBackstubeOrderStatus } from "@/app/admin/order-actions";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

function formatEUR(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function OrderItem({ order }: { order: BackstubeOrder }) {
  const [status, setStatus] = useState(order.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDone = status === "erledigt";
  const next = isDone ? "neu" : "erledigt";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setBackstubeOrderStatus(order.id, next);
      if (result.ok) setStatus(next);
      else setError(result.error);
    });
  }

  return (
    <div className={`inbox-item${isDone ? " is-done" : ""}`}>
      <div className="inbox-head">
        <span className="inbox-name">{order.customerName}</span>
        <span className="inbox-date">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="inbox-meta">
        {order.email && (
          <a href={`mailto:${order.email}`}>
            <IconMail size={15} stroke={1.75} aria-hidden /> {order.email}
          </a>
        )}
        {order.phone && (
          <a href={`tel:${order.phone}`}>
            <IconPhone size={15} stroke={1.75} aria-hidden /> {order.phone}
          </a>
        )}
        {order.backtagLabel && <span>Backtag: {order.backtagLabel}</span>}
      </div>

      <ul className="order-lines">
        {order.items.map((line) => (
          <li key={line.id || line.name}>
            <span className="order-line-qty">{line.qty}×</span>
            <span className="order-line-name">{line.name}</span>
            <span className="order-line-price">
              {formatEUR(line.unitPrice * line.qty)}
            </span>
          </li>
        ))}
        <li className="order-lines-total">
          <span className="order-line-name">Summe</span>
          <span className="order-line-price">{formatEUR(order.total)}</span>
        </li>
      </ul>

      {order.note && <p className="inbox-message">{order.note}</p>}

      <div className="inbox-actions">
        <span className={`inbox-status${isDone ? " is-done" : " is-new"}`}>
          {isDone ? "Erledigt" : "Offen"}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggle}
          disabled={pending}
        >
          {isDone ? (
            <>
              <IconRotate size={16} stroke={1.75} aria-hidden />
              Wieder als „offen"
            </>
          ) : (
            <>
              <IconCheck size={16} stroke={1.75} aria-hidden />
              Als erledigt markieren
            </>
          )}
        </button>
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export function OrdersInbox({ orders }: { orders: BackstubeOrder[] }) {
  if (orders.length === 0) {
    return <p className="inbox-empty">Noch keine Vorbestellungen eingegangen.</p>;
  }
  return (
    <div className="inbox-list">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}
