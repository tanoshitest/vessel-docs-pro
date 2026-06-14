import { useEffect } from "react";
import { X, Printer } from "lucide-react";
import type { CustomerInfo, Equipment, ServiceItem } from "@/lib/pdfExport";

interface PrintPreviewProps {
  type: "kt" | "nt";
  customer: CustomerInfo;
  equipments: Equipment[];
  services: ServiceItem[];
  onClose: () => void;
}

export function PrintPreview({
  type,
  customer,
  equipments,
  services,
  onClose,
}: PrintPreviewProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isKiemTra = type === "kt";

  return (
    <div className="print-preview fixed inset-0 z-50 flex flex-col bg-white">
      {/* Toolbar - hidden when printing */}
      <div className="no-print flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {isKiemTra ? "Biên Bản Kiểm Tra" : "Biên Bản Nghiệm Thu"}
          </span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            Print Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            <Printer className="h-4 w-4" /> In
          </button>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      onboarding      {/* Document area */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
        <div className="mx-auto max-w-[210mm] bg-white p-8 shadow-sm sm:p-[20mm]">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-lg font-bold uppercase tracking-wide text-slate-900 sm:text-xl">
              {isKiemTra
                ? "Biên Bản Kiểm Tra Thiết Bị Vô Tuyến Điện Hàng Hải"
                : "Biên Bản Nghiệm Thu Dịch Vụ"}
            </h1>
            <div className="mx-auto mt-3 h-0.5 w-24 bg-slate-900" />
          </div>

          {/* Info grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="Công ty" value={customer.company} />
            <InfoRow label="Tàu / Vessel" value={customer.vessel} />
            <InfoRow label="MMSI" value={customer.mmsi} />
            <InfoRow label="Ngày / Date" value={customer.date} />
            <InfoRow label="Số công việc / Job No." value={customer.jobNumber} />
          </div>

          {/* Table */}
          {isKiemTra ? (
            <>
              <h2 className="mb-3 text-sm font-bold uppercase text-slate-900">
                Danh sách thiết bị kiểm tra
              </h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-slate-700">
                      STT
                    </th>
                    <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-slate-700">
                      Loại thiết bị
                    </th>
                    <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-slate-700">
                      Hãng / Model
                    </th>
                    <th className="py-2 text-left text-xs font-bold uppercase text-slate-700">
                      Số serial
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map((eq, i) => (
                    <tr key={eq.id} className="border-b border-slate-200">
                      <td className="py-2 pr-3 text-slate-900">{i + 1}</td>
                      <td className="py-2 pr-3 text-slate-900">{eq.type}</td>
                      <td className="py-2 pr-3 text-slate-900">
                        {eq.maker} / {eq.model}
                      </td>
                      <td className="py-2 text-slate-900">{eq.serial}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-sm font-bold uppercase text-slate-900">
                Danh sách dịch vụ nghiệm thu
              </h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-slate-700">
                      STT
                    </th>
                    <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-slate-700">
                      Nội dung dịch vụ
                    </th>
                    <th className="py-2 pr-3 text-right text-xs font-bold uppercase text-slate-700">
                      SL
                    </th>
                    <th className="py-2 text-left text-xs font-bold uppercase text-slate-700">
                      ĐVT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="py-2 pr-3 text-slate-900">{i + 1}</td>
                      <td className="py-2 pr-3 text-slate-900">{s.description}</td>
                      <td className="py-2 pr-3 text-right text-slate-900">
                        {s.quantity}
                      </td>
                      <td className="py-2 text-slate-900">{s.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Signature area */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-slate-700">
                Người lập / Prepared by
              </p>
              <div className="mt-16 border-t border-slate-400 pt-2 text-xs text-slate-500">
                Ký & ghi rõ họ tên
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-slate-700">
                Xác nhận / Confirmed by
              </p>
              <div className="mt-16 border-t border-slate-400 pt-2 text-xs text-slate-500">
                Ký & ghi rõ họ tên
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-10 text-center text-[10px] text-slate-400">
            Generated by Field Service Management App — {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}:</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
