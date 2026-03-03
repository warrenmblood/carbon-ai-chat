/*
 *  Copyright IBM Corp. 2026
 *
 *  This source code is licensed under the Apache-2.0 license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *  @license
 */

import React, { useState, useCallback } from "react";
import {
  HistoryShell,
  HistoryHeader,
  HistoryToolbar,
  HistoryContent,
  HistoryPanel,
  HistoryPanelMenu,
  HistoryPanelItem,
  HistoryPanelItems,
  HistorySearchItem,
  HistoryDeletePanel,
} from "@carbon/ai-chat-components/es/react/history";
import {
  historyItemActions,
  pinnedHistoryItemActions,
  pinnedHistoryItems,
  historyItems,
} from "./chat-history-data";
import { PinFilled, Search } from "@carbon/icons-react";
import "./ChatHistoryExample.css";

interface resultItem {
  id: string;
  title: string;
  lastUpdated: string;
  isPinned: boolean;
  section?: string;
  selected?: boolean;
}

interface ChatHistoryExampleProps {
  headerTitle: string;
  searchOff: boolean;
  showCloseAction: boolean;
}

function ChatHistoryExample({
  headerTitle,
  searchOff,
  showCloseAction,
}: ChatHistoryExampleProps) {
  const [searchResults, setSearchResults] = useState<resultItem[]>([]);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pinnedItems, setPinnedItems] = useState(
    pinnedHistoryItems.map((item) => ({ ...item, rename: false })),
  );
  const [regularItems, setRegularItems] = useState(
    historyItems.map((section) => ({
      ...section,
      chats: section.chats.map((chat) => ({ ...chat, rename: false })),
    })),
  );

  const handleHistoryItemAction = useCallback((event: any) => {
    const action = event.detail.action;

    if (action === "Delete") {
      setItemToDelete(event.detail.itemId);
      setShowDeletePanel(true);
    } else if (action === "Rename") {
      const element = event.detail.element;
      if (element) {
        element.rename = true;
      }
    }
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setShowDeletePanel(false);
    setItemToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete) {
      // Remove from pinned items
      setPinnedItems((prev) => prev.filter((item) => item.id !== itemToDelete));

      // Remove from regular items
      setRegularItems((prev) =>
        prev.map((section) => ({
          ...section,
          chats: section.chats.filter((chat) => chat.id !== itemToDelete),
        })),
      );
    }

    setShowDeletePanel(false);
    setItemToDelete(null);
  }, [itemToDelete]);

  const handleSearchInput = useCallback((event: any) => {
    const searchVal = event.detail.value.toLowerCase();

    // Combine all results into a single array
    const results: any[] = [];

    // Add matching pinned items
    pinnedHistoryItems.forEach((item) => {
      if (item.title.toLowerCase().includes(searchVal)) {
        results.push({
          ...item,
          isPinned: true,
        });
      }
    });

    // Add matching history items
    historyItems.forEach((section) => {
      section.chats.forEach((chat) => {
        if (chat.title.toLowerCase().includes(searchVal)) {
          results.push({
            ...chat,
            section: section.section,
            isPinned: false,
          });
        }
      });
    });

    setSearchResults(results);
    setSearchTotalCount(results.length);
    setSearchValue(searchVal);
  }, []);

  const showSearchResults = searchTotalCount > 0 && searchValue;
  const noSearchResults = searchTotalCount === 0 && searchValue;

  return (
    <HistoryShell className="history-shell">
      <HistoryHeader title={headerTitle} showCloseAction={showCloseAction} />
      <HistoryToolbar
        searchOff={searchOff}
        onCdsSearchInput={handleSearchInput}
      />
      <HistoryContent className="history-content">
        {(showSearchResults || noSearchResults) && (
          <div slot="results-count">Results: {searchTotalCount}</div>
        )}
        <HistoryPanel aria-label="Chat history">
          <HistoryPanelItems>
            {noSearchResults && (
              <HistoryPanelMenu expanded title="Search results">
                <Search slot="title-icon" />
                <HistorySearchItem disabled>
                  No available chats
                </HistorySearchItem>
              </HistoryPanelMenu>
            )}
            {showSearchResults && (
              <HistoryPanelMenu expanded title="Search results">
                <Search slot="title-icon" />
                {searchResults.map((result) => (
                  <HistorySearchItem key={result.id} date={result.lastUpdated}>
                    {result.title}
                  </HistorySearchItem>
                ))}
              </HistoryPanelMenu>
            )}
            {!showSearchResults && !noSearchResults && (
              <>
                <HistoryPanelMenu expanded title="Pinned">
                  <PinFilled slot="title-icon" />
                  {pinnedItems.map((item) => (
                    <HistoryPanelItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      selected={item.selected}
                      rename={item.rename}
                      actions={pinnedHistoryItemActions}
                      onHistoryItemMenuAction={handleHistoryItemAction}
                    />
                  ))}
                </HistoryPanelMenu>
                {regularItems.map((item) => (
                  <HistoryPanelMenu
                    key={item.section}
                    expanded
                    title={item.section}
                  >
                    <Search slot="title-icon" />
                    {item.chats.map((chat) => (
                      <HistoryPanelItem
                        key={chat.id}
                        id={chat.id}
                        title={chat.title}
                        rename={chat.rename}
                        actions={historyItemActions}
                        onHistoryItemMenuAction={handleHistoryItemAction}
                      />
                    ))}
                  </HistoryPanelMenu>
                ))}
              </>
            )}
          </HistoryPanelItems>
        </HistoryPanel>
      </HistoryContent>
      {showDeletePanel && (
        <HistoryDeletePanel
          onHistoryDeleteCancel={handleDeleteCancel}
          onHistoryDeleteConfirm={handleDeleteConfirm}
        >
          <div slot="title">Confirm Delete</div>
          <div slot="description">
            This conversation will be permanently deleted.
          </div>
        </HistoryDeletePanel>
      )}
    </HistoryShell>
  );
}

export { ChatHistoryExample };

// Made with Bob
