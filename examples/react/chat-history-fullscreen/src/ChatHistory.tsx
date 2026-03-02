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
} from "@carbon/ai-chat-components/es/react/history";

import {
  historyItemActions,
  pinnedHistoryItemActions,
  pinnedHistoryItems,
  historyItems,
} from "./chat-history-data";

import { PinFilled, Search } from "@carbon/icons-react";

export const Default = {
  argTypes: {
    HeaderTitle: {
      control: "text",
      description: "Header title text of the chat history shell",
    },
  },
  args: {
    HeaderTitle: "Conversations",
  },
  render: (args) => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTotalCount, setSearchTotalCount] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    const [pinnedItems, setPinnedItems] = useState(
      pinnedHistoryItems.map((item) => ({ ...item, rename: false })),
    );
    const [regularItems, setRegularItems] = useState(
      historyItems.map((section) => ({
        ...section,
        chats: section.chats.map((chat) => ({ ...chat, rename: false })),
      })),
    );

    const handleHistoryItemAction = useCallback((event) => {
      // Handle rename action
      if (event.detail.action === "Rename") {
        const element = event.detail.element;
        if (element) {
          element.rename = true;
        }
      }
    }, []);

    const handleSearchInput = useCallback((event) => {
      const searchVal = event.detail.value.toLowerCase();

      // Combine all results into a single array
      const results = [];

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
      <HistoryShell>
        <HistoryHeader title={args.HeaderTitle} />
        <HistoryToolbar onCdsSearchInput={handleSearchInput} />
        <HistoryContent>
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
                    <HistorySearchItem
                      key={result.id}
                      date={result.lastUpdated}
                    >
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
                        onHistoryItemAction={handleHistoryItemAction}
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
                          onHistoryItemAction={handleHistoryItemAction}
                        />
                      ))}
                    </HistoryPanelMenu>
                  ))}
                </>
              )}
            </HistoryPanelItems>
          </HistoryPanel>
        </HistoryContent>
      </HistoryShell>
    );
  },
};