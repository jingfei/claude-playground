import SearchBox from './components/SearchBox'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-xl flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-gray-100 tracking-tight text-center mb-2">
          Search
        </h1>
        <SearchBox />
        <p className="text-xs text-gray-600 text-center mt-2">
          Try&nbsp;
          <span className="text-gray-500">engineering</span>,&nbsp;
          <span className="text-gray-500">alice</span>,&nbsp;
          <span className="text-gray-500">api</span>, or&nbsp;
          <span className="text-gray-500">design</span>
        </p>
      </div>
    </div>
  )
}
