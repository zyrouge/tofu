export class ArrayUtils {
    // TODO: filtered manually because typescript was drunk
    static filterTruthy<T>(values: (T | "" | false | null | undefined)[]): T[] {
        const filtered: T[] = [];
        for (const x of values) {
            if (x) {
                filtered.push(x);
            }
        }
        return filtered;
    }
}
