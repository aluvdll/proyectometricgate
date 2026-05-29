import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/apiBase";

export function Dashboard() {
  const { user } = useAuth();

  const fullName = [user?.name, user?.apellido1, user?.apellido2]
    .filter(Boolean)
    .join(" ")
    .trim();

  const companyName =
    user?.company?.fiscal_name ||
    user?.company?.name ||
    user?.company_name ||
    user?.companyName;

  function getAvatarUrl() {
    const avatar = user?.avatar || user?.avatarUrl || user?.avatar_url || "";

    if (!avatar || avatar === "0") return "/ico_avatar_default.png";

    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }

    if (avatar.startsWith("/storage/")) {
      return `${API_URL}${avatar}`;
    }

    if (avatar.startsWith("storage/")) {
      return `${API_URL}/${avatar}`;
    }

    return `${API_URL}/storage/${avatar}`;
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col">
        <img src="/logo_MetricGate.png" alt="bienvenido" />
        <h1 className="mt-6">Bienvenido</h1>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <img
            src={getAvatarUrl()}
            alt="avatar usuario"
            className="h-22 w-22 rounded-full border border-orange-300 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/ico_avatar_default.png";
            }}
          />
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-orange-700">
              Usuario
            </p>
            <p className="text-base font-semibold text-slate-900">{fullName}</p>
            <p className="text-sm mt-12 font-bold text-slate-900">
              Empresa: {companyName}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
