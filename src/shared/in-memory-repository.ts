/**
 * SLICE-00 in-memory repository scaffold.
 * Satisfies contracts before a persistent ORM/DB is chosen (plan Risk:
 * backend ORM/database choice is [NEEDS CLARIFICATION]). Later slices back
 * their Tier-1 *Entity records with this until a DB is introduced.
 */
export class InMemoryRepository<T extends { id: string }> {
  private readonly store = new Map<string, T>()

  findAll(): T[] {
    return [...this.store.values()]
  }

  findById(id: string): T | undefined {
    return this.store.get(id)
  }

  save(entity: T): T {
    this.store.set(entity.id, entity)
    return entity
  }

  delete(id: string): boolean {
    return this.store.delete(id)
  }

  clear(): void {
    this.store.clear()
  }
}
