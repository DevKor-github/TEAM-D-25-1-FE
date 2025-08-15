// src/hooks/useOncePerUser.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 선택: Firebase Auth를 쓰고 있으면 uid를 자동으로 가져옵니다.
// 프로젝트에 @react-native-firebase/auth 가 없다면 try/catch 덕분에 그냥 무시됩니다.
let getCurrentUid = () => null as string | null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getAuth } = require('@react-native-firebase/auth');
  getCurrentUid = () => {
    try {
      return getAuth()?.currentUser?.uid ?? null;
    } catch {
      return null;
    }
  };
} catch {
  // no-op
}

export type OnceFlagScope = 'user' | 'device';

export type UseOncePerUserOptions = {
  /** 해당 플래그의 이름(필수). 예: 'mypage-onboarding' */
  key: string;
  /** 강제로 특정 userId를 쓰고 싶을 때 지정. 미지정 시 Firebase uid 자동 사용, 없으면 device */
  userId?: string | null;
  /** 스코프: 'user'(기본) 이면 userId 별, 'device' 이면 기기 전체 */
  scope?: OnceFlagScope;
  /** 온보딩 개정판 등을 위해 버전이 바뀌면 새로운 키로 간주되어 다시 노출됩니다. */
  version?: string | number;
  /** 기본값: 저장된 값이 없을 때 show=true 로 시작할지 여부 (기본: true) */
  defaultShowIfMissing?: boolean;
};

function buildStorageKey(baseKey: string, scope: OnceFlagScope, userId: string | null, version?: string | number) {
  const ver = version != null ? `:v${version}` : '';
  if (scope === 'user') {
    return `once:${baseKey}:user:${userId ?? 'anon'}${ver}`;
  }
  return `once:${baseKey}:device${ver}`;
}

export type UseOncePerUserReturn = {
  /** 저장 로딩 중인지 */
  loading: boolean;
  /** 이미 본 상태인지 */
  seen: boolean;
  /** 보여줘야 하는지 (보통 seen의 반대) */
  show: boolean;
  /** 본 것으로 마킹하고 show=false 로 전환 */
  markSeen: () => Promise<void>;
  /** 저장값 제거(테스트/리셋용) */
  reset: () => Promise<void>;
  /** 내부적으로 사용하는 최종 storage key (디버그용) */
  storageKey: string;
};

export function useOncePerUser(opts: UseOncePerUserOptions): UseOncePerUserReturn {
  const {
    key,
    userId: userIdProp,
    scope = 'user',
    version,
    defaultShowIfMissing = true,
  } = opts;

  const resolvedUserId = useMemo(() => {
    if (scope === 'device') return null;
    if (typeof userIdProp === 'string') return userIdProp;
    return getCurrentUid();
  }, [scope, userIdProp]);

  const storageKey = useMemo(
    () => buildStorageKey(key, scope, resolvedUserId, version),
    [key, scope, resolvedUserId, version],
  );

  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(false);

  // 최초 로드
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    (async () => {
      try {
        const v = await AsyncStorage.getItem(storageKey);
        if (!mountedRef.current) return;
        setSeen(!!v); // 값 있으면 본 것(true)
      } catch {
        if (!mountedRef.current) return;
        // 스토리지 에러 시에도 UX 지속: 없는 것처럼 취급
        setSeen(false);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [storageKey]);

  const markSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(storageKey, '1');
      if (mountedRef.current) setSeen(true);
    } catch {
      // 저장 실패해도 상태만 전환
      if (mountedRef.current) setSeen(true);
    }
  }, [storageKey]);

  const reset = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      if (mountedRef.current) setSeen(false);
    } catch {
      if (mountedRef.current) setSeen(false);
    }
  }, [storageKey]);

  const show = !seen ? true : false;
  // 저장값이 없고 로딩이 끝났는데 기본 노출을 끄고 싶다면:
  const effectiveShow = loading ? false : (seen ? false : defaultShowIfMissing);

  return {
    loading,
    seen,
    show: effectiveShow,
    markSeen,
    reset,
    storageKey,
  };
}

/** 디버그/테스트용: 특정 키(버전 포함)를 전체 제거 */
export async function resetOnceFlagGlobally(key: string, version?: string | number) {
  const k1 = buildStorageKey(key, 'device', null, version);
  await AsyncStorage.removeItem(k1);
  const uid = getCurrentUid();
  const k2 = buildStorageKey(key, 'user', uid, version);
  await AsyncStorage.removeItem(k2);
}
