export default abstract class Tracker {
  public abstract connect (): Promise<this>
  public abstract disconnect (): Promise<void>
}
