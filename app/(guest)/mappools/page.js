'use client'

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Mappools() {

  const roundsQuery = useQuery({
    queryKey: ['rounds'],
    queryFn: async () => {
      const response = await axios.get('/api/rounds/visible');
      if (response.status !== 200)
        throw new Error("failed to fetch visible rounds!");

      return response.data
    },
  })

  return (
    <div className="ml-2 mt-2">
      <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
        <p>Mappools</p>
      </h1>
      {roundsQuery.isLoading ? <span className="loading loading-spinner"></span> : roundsQuery.data.map((round_data) => (
        <div>
          {round_data.name}
        </div>
      ))}
    </div>
  )
}
