import React from 'react'

export default function Dashboard() {
  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Account Balance</h2>
          <p className="text-2xl text-green-400">0 CVT</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Characters</h2>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  )
}
