// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { makeCallback } from "./_fs_common.ts";
import { getValidatedPath, getValidMode } from "../internal/fs/utils.mjs";
import { fs, os } from "../internal_binding/constants.ts";
export function copyFile(src, dest, mode, callback) {
  if (typeof mode === "function") {
    callback = mode;
    mode = 0;
  }
  const srcStr = getValidatedPath(src, "src").toString();
  const destStr = getValidatedPath(dest, "dest").toString();
  const modeNum = getValidMode(mode, "copyFile");
  const cb = makeCallback(callback);
  if ((modeNum & fs.COPYFILE_EXCL) === fs.COPYFILE_EXCL) {
    Deno.lstat(destStr).then(()=>{
      // deno-lint-ignore no-explicit-any
      const e = new Error(`EEXIST: file already exists, copyfile '${srcStr}' -> '${destStr}'`);
      e.syscall = "copyfile";
      e.errno = os.errno.EEXIST;
      e.code = "EEXIST";
      cb(e);
    }, (e)=>{
      if (e instanceof Deno.errors.NotFound) {
        Deno.copyFile(srcStr, destStr).then(()=>cb(null), cb);
      }
      cb(e);
    });
  } else {
    Deno.copyFile(srcStr, destStr).then(()=>cb(null), cb);
  }
}
export function copyFileSync(src, dest, mode) {
  const srcStr = getValidatedPath(src, "src").toString();
  const destStr = getValidatedPath(dest, "dest").toString();
  const modeNum = getValidMode(mode, "copyFile");
  if ((modeNum & fs.COPYFILE_EXCL) === fs.COPYFILE_EXCL) {
    try {
      Deno.lstatSync(destStr);
      throw new Error(`A file exists at the destination: ${destStr}`);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        Deno.copyFileSync(srcStr, destStr);
      }
      throw e;
    }
  } else {
    Deno.copyFileSync(srcStr, destStr);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvX2ZzL19mc19jb3B5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgdHlwZSB7IENhbGxiYWNrV2l0aEVycm9yIH0gZnJvbSBcIi4vX2ZzX2NvbW1vbi50c1wiO1xuaW1wb3J0IHsgbWFrZUNhbGxiYWNrIH0gZnJvbSBcIi4vX2ZzX2NvbW1vbi50c1wiO1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIi4uL2J1ZmZlci50c1wiO1xuaW1wb3J0IHsgZ2V0VmFsaWRhdGVkUGF0aCwgZ2V0VmFsaWRNb2RlIH0gZnJvbSBcIi4uL2ludGVybmFsL2ZzL3V0aWxzLm1qc1wiO1xuaW1wb3J0IHsgZnMsIG9zIH0gZnJvbSBcIi4uL2ludGVybmFsX2JpbmRpbmcvY29uc3RhbnRzLnRzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5RmlsZShcbiAgc3JjOiBzdHJpbmcgfCBCdWZmZXIgfCBVUkwsXG4gIGRlc3Q6IHN0cmluZyB8IEJ1ZmZlciB8IFVSTCxcbiAgY2FsbGJhY2s6IENhbGxiYWNrV2l0aEVycm9yLFxuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBjb3B5RmlsZShcbiAgc3JjOiBzdHJpbmcgfCBCdWZmZXIgfCBVUkwsXG4gIGRlc3Q6IHN0cmluZyB8IEJ1ZmZlciB8IFVSTCxcbiAgbW9kZTogbnVtYmVyLFxuICBjYWxsYmFjazogQ2FsbGJhY2tXaXRoRXJyb3IsXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHlGaWxlKFxuICBzcmM6IHN0cmluZyB8IEJ1ZmZlciB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgQnVmZmVyIHwgVVJMLFxuICBtb2RlOiBudW1iZXIgfCBDYWxsYmFja1dpdGhFcnJvcixcbiAgY2FsbGJhY2s/OiBDYWxsYmFja1dpdGhFcnJvcixcbik6IHZvaWQge1xuICBpZiAodHlwZW9mIG1vZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNhbGxiYWNrID0gbW9kZTtcbiAgICBtb2RlID0gMDtcbiAgfVxuICBjb25zdCBzcmNTdHIgPSBnZXRWYWxpZGF0ZWRQYXRoKHNyYywgXCJzcmNcIikudG9TdHJpbmcoKTtcbiAgY29uc3QgZGVzdFN0ciA9IGdldFZhbGlkYXRlZFBhdGgoZGVzdCwgXCJkZXN0XCIpLnRvU3RyaW5nKCk7XG4gIGNvbnN0IG1vZGVOdW0gPSBnZXRWYWxpZE1vZGUobW9kZSwgXCJjb3B5RmlsZVwiKTtcbiAgY29uc3QgY2IgPSBtYWtlQ2FsbGJhY2soY2FsbGJhY2spO1xuXG4gIGlmICgobW9kZU51bSAmIGZzLkNPUFlGSUxFX0VYQ0wpID09PSBmcy5DT1BZRklMRV9FWENMKSB7XG4gICAgRGVuby5sc3RhdChkZXN0U3RyKS50aGVuKCgpID0+IHtcbiAgICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgICBjb25zdCBlOiBhbnkgPSBuZXcgRXJyb3IoXG4gICAgICAgIGBFRVhJU1Q6IGZpbGUgYWxyZWFkeSBleGlzdHMsIGNvcHlmaWxlICcke3NyY1N0cn0nIC0+ICcke2Rlc3RTdHJ9J2AsXG4gICAgICApO1xuICAgICAgZS5zeXNjYWxsID0gXCJjb3B5ZmlsZVwiO1xuICAgICAgZS5lcnJubyA9IG9zLmVycm5vLkVFWElTVDtcbiAgICAgIGUuY29kZSA9IFwiRUVYSVNUXCI7XG4gICAgICBjYihlKTtcbiAgICB9LCAoZSkgPT4ge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgICBEZW5vLmNvcHlGaWxlKHNyY1N0ciwgZGVzdFN0cikudGhlbigoKSA9PiBjYihudWxsKSwgY2IpO1xuICAgICAgfVxuICAgICAgY2IoZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgRGVuby5jb3B5RmlsZShzcmNTdHIsIGRlc3RTdHIpLnRoZW4oKCkgPT4gY2IobnVsbCksIGNiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weUZpbGVTeW5jKFxuICBzcmM6IHN0cmluZyB8IEJ1ZmZlciB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgQnVmZmVyIHwgVVJMLFxuICBtb2RlPzogbnVtYmVyLFxuKTogdm9pZCB7XG4gIGNvbnN0IHNyY1N0ciA9IGdldFZhbGlkYXRlZFBhdGgoc3JjLCBcInNyY1wiKS50b1N0cmluZygpO1xuICBjb25zdCBkZXN0U3RyID0gZ2V0VmFsaWRhdGVkUGF0aChkZXN0LCBcImRlc3RcIikudG9TdHJpbmcoKTtcbiAgY29uc3QgbW9kZU51bSA9IGdldFZhbGlkTW9kZShtb2RlLCBcImNvcHlGaWxlXCIpO1xuXG4gIGlmICgobW9kZU51bSAmIGZzLkNPUFlGSUxFX0VYQ0wpID09PSBmcy5DT1BZRklMRV9FWENMKSB7XG4gICAgdHJ5IHtcbiAgICAgIERlbm8ubHN0YXRTeW5jKGRlc3RTdHIpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIGZpbGUgZXhpc3RzIGF0IHRoZSBkZXN0aW5hdGlvbjogJHtkZXN0U3RyfWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICAgICAgRGVuby5jb3B5RmlsZVN5bmMoc3JjU3RyLCBkZXN0U3RyKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIERlbm8uY29weUZpbGVTeW5jKHNyY1N0ciwgZGVzdFN0cik7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsU0FBUyxZQUFZLFFBQVEsa0JBQWtCO0FBRS9DLFNBQVMsZ0JBQWdCLEVBQUUsWUFBWSxRQUFRLDJCQUEyQjtBQUMxRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFFBQVEsbUNBQW1DO0FBYTFELE9BQU8sU0FBUyxTQUNkLEdBQTBCLEVBQzFCLElBQTJCLEVBQzNCLElBQWdDLEVBQ2hDLFFBQTRCO0VBRTVCLElBQUksT0FBTyxTQUFTLFlBQVk7SUFDOUIsV0FBVztJQUNYLE9BQU87RUFDVDtFQUNBLE1BQU0sU0FBUyxpQkFBaUIsS0FBSyxPQUFPLFFBQVE7RUFDcEQsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFFBQVEsUUFBUTtFQUN2RCxNQUFNLFVBQVUsYUFBYSxNQUFNO0VBQ25DLE1BQU0sS0FBSyxhQUFhO0VBRXhCLElBQUksQ0FBQyxVQUFVLEdBQUcsYUFBYSxNQUFNLEdBQUcsYUFBYSxFQUFFO0lBQ3JELEtBQUssS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDO01BQ3ZCLG1DQUFtQztNQUNuQyxNQUFNLElBQVMsSUFBSSxNQUNqQixDQUFDLHVDQUF1QyxFQUFFLE9BQU8sTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO01BRXJFLEVBQUUsT0FBTyxHQUFHO01BQ1osRUFBRSxLQUFLLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTTtNQUN6QixFQUFFLElBQUksR0FBRztNQUNULEdBQUc7SUFDTCxHQUFHLENBQUM7TUFDRixJQUFJLGFBQWEsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3JDLEtBQUssUUFBUSxDQUFDLFFBQVEsU0FBUyxJQUFJLENBQUMsSUFBTSxHQUFHLE9BQU87TUFDdEQ7TUFDQSxHQUFHO0lBQ0w7RUFDRixPQUFPO0lBQ0wsS0FBSyxRQUFRLENBQUMsUUFBUSxTQUFTLElBQUksQ0FBQyxJQUFNLEdBQUcsT0FBTztFQUN0RDtBQUNGO0FBRUEsT0FBTyxTQUFTLGFBQ2QsR0FBMEIsRUFDMUIsSUFBMkIsRUFDM0IsSUFBYTtFQUViLE1BQU0sU0FBUyxpQkFBaUIsS0FBSyxPQUFPLFFBQVE7RUFDcEQsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFFBQVEsUUFBUTtFQUN2RCxNQUFNLFVBQVUsYUFBYSxNQUFNO0VBRW5DLElBQUksQ0FBQyxVQUFVLEdBQUcsYUFBYSxNQUFNLEdBQUcsYUFBYSxFQUFFO0lBQ3JELElBQUk7TUFDRixLQUFLLFNBQVMsQ0FBQztNQUNmLE1BQU0sSUFBSSxNQUFNLENBQUMsa0NBQWtDLEVBQUUsUUFBUSxDQUFDO0lBQ2hFLEVBQUUsT0FBTyxHQUFHO01BQ1YsSUFBSSxhQUFhLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNyQyxLQUFLLFlBQVksQ0FBQyxRQUFRO01BQzVCO01BQ0EsTUFBTTtJQUNSO0VBQ0YsT0FBTztJQUNMLEtBQUssWUFBWSxDQUFDLFFBQVE7RUFDNUI7QUFDRiJ9