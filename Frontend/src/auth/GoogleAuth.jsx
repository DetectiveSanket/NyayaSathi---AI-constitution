import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginWithGoogle } from "../features/auth/authThunks";

/**
 * Full-width style button: Firebase popup → backend JWT (same Redux path as email login).
 */
export default function GoogleAuth({ className = "", imgSrc, imgAlt = "Google" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.auth.loading);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (loading || busy) return;
    setBusy(true);
    try {
      const result = await dispatch(loginWithGoogle());
      if (loginWithGoogle.fulfilled.match(result)) {
        toast.success("Signed in with Google");
        navigate("/chatbot");
      } else {
        toast.error(result.payload || "Google sign-in failed");
      }
    } catch (e) {
      toast.error(e?.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || busy}
      className={
        className ||
        "flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-transparent border-2 border-gray-700 focus:border-teal-500 rounded-full hover:bg-[#1b4f4b81] whitespace-nowrap disabled:opacity-50"
      }
    >
      {imgSrc ? <img src={imgSrc} className="w-6 h-6 flex-shrink-0" alt={imgAlt} /> : null}
      <span>{busy ? "Signing in…" : "Continue with Google"}</span>
    </button>
  );
}
