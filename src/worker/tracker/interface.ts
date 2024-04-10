export default abstract class Tracker {
  public abstract connect (): void
  public abstract disconnect (): Promise<void>
}
