import { useRouter } from "next/router"

export default function SessionBreakdown() {
  const router = useRouter()
  return (
    <div>{router.query.session}</div>
  )
}
