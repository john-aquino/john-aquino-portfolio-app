import LeftColumn from "../components/LeftColumn"
import RightColumn from "../components/RightColumn"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LeftColumn />
      <RightColumn />
    </div>
    {/* <ExperienceSection /> */}
    </div>
  )
}
