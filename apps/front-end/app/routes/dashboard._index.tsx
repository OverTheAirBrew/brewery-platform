import { MetaFunction } from "@remix-run/node"

export const meta: MetaFunction = () => {
  return [
    {title: 'Dashboard'}
  ]
}

export default function DashboardIndex() {
  return (
    <>
     <div className="my-6">
        A
      </div>
        B
      <div className="my-6">
        C
      </div>
    </>
  )
}