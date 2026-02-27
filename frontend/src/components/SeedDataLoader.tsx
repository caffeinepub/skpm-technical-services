import { useEffect, useRef } from 'react';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { seedDataIfEmpty } from '../lib/seedData';

export default function SeedDataLoader() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;
    seeded.current = true;
    seedDataIfEmpty(actor).then(() => {
      queryClient.invalidateQueries();
    }).catch(() => {
      seeded.current = false;
    });
  }, [actor, isFetching, queryClient]);

  return null;
}
