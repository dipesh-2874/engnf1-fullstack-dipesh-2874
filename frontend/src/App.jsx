import logo from './assets/logo.svg'

function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center px-6 py-12 sm:px-12">
      <img src={logo} alt="" width="48" height="48" />
      <h1 className="mt-5 break-words text-4xl font-semibold text-highlight sm:text-5xl">TriageSync</h1>
      <p className="mt-3 text-lg">Support triage and resource scheduling</p>
    </main>
  )
}

export default App
