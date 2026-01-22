import { useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

export default (userIdsToExclude, onSearchUsers) => {
  const handleSearchUsersQueryChange = useCallback(
    (query) => {
      // When there is no input value, the searchedUsers prop will be empty from Redux
      if (query !== '') {
        // Exclude some from search results in case they are already bound
        onSearchUsers(query, userIdsToExclude);
      }
    },
    [onSearchUsers, userIdsToExclude],
  );

  const debouncedHandleUsersQuery = useMemo(
    () => debounce(handleSearchUsersQueryChange, 500),
    [handleSearchUsersQueryChange],
  );

  useEffect(() => {
    return () => {
      debouncedHandleUsersQuery.cancel();
    };
  }, [debouncedHandleUsersQuery]);

  return [debouncedHandleUsersQuery];
};
