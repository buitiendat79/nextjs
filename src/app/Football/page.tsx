'use client';

import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

// import { connectMQTT, disconnectMQTT } from '@/lib/mqtt';
import { useMQTTStore } from '@/app/stores/mqttstore';

const getSlug = (name: string) => name.toLowerCase().replace(/ /g, '-');

const convertStatusCode = (code: number) => {
  switch (code) {
    case 0:
      return 'Sắp diễn ra';
    case 1:
      return 'Đang diễn ra';
    case 3:
      return 'Đã kết thúc';
    case 5:
      return 'Hoãn';
    case 6:
      return 'Hủy';
    case 7:
      return 'Gián đoạn';
    default:
      return 'Không rõ';
  }
};

const parseMatchDataArray = (matchDataString: string | null | undefined) => {
  if (!matchDataString || matchDataString.length <= 0) return [];
  const matchDataArray = matchDataString.split('!!');

  return matchDataArray.map((matchString) => {
    const matchDetails = matchString.split('^');
    const time = Number(matchDetails[17]) === -1 ? {} : {
      status: convertStatusCode(Number(matchDetails[9])),
      currentPeriodStartTimestamp: Number(matchDetails[17]),
    };

    return {
      id: matchDetails[0],
      startTimestamp: Number(matchDetails[1]),
      tournament: {
        id: matchDetails[2],
        priority: Number(matchDetails[3]),
        name: matchDetails[4],
        slug: matchDetails[5],
        group_num: Number(matchDetails[6]),
        category: {
          id: matchDetails[7],
          name: matchDetails[8],
          slug: getSlug(matchDetails[8]),
        },
        primary_color: matchDetails[36] || '',
        secondary_color: matchDetails[37] || '',
      },
      statusCode: Number(matchDetails[9]), // dùng để lọc
      status: convertStatusCode(Number(matchDetails[9])),
      homeTeam: {
        id: matchDetails[10],
        name: matchDetails[11],
        slug: matchDetails[12],
      },
      awayTeam: {
        id: matchDetails[13],
        name: matchDetails[14],
        slug: matchDetails[15],
      },
      stage_id: matchDetails[16],
      time,
      homeScore: {
        display: Number(matchDetails[18]),
        period1: Number(matchDetails[19]),
        period2: Number(matchDetails[20]),
      },
      awayScore: {
        display: Number(matchDetails[21]),
        period1: Number(matchDetails[22]),
        period2: Number(matchDetails[23]),
      },
      slug: matchDetails[24],
      roundInfo: { round: Number(matchDetails[25]) },
      winnerCode: Number(matchDetails[26]),
      lineup: Number(matchDetails[27]),
      homeRedCards: Number(matchDetails[28]),
      awayRedCards: Number(matchDetails[29]),
      homeYellowCards: Number(matchDetails[30]),
      awayYellowCards: Number(matchDetails[31]),
      homeCornerKicks: Number(matchDetails[32]),
      awayCornerKicks: Number(matchDetails[33]),
      season_id: matchDetails[34],
      is_id: matchDetails[35],
      period: matchDetails[38], 
      timer: matchDetails[39], 
    };
  });
};

const TABS = ['All', 'Live', 'Ended'];

const FootballMatchesPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('Tất cả');

  const { messages } = useMQTTStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.uniscore.com/api/v1/sport/football/events/live');
        const raw = res?.data?.data?.events;
        if (typeof raw !== 'string') {
          console.error('"events" không phải chuỗi. Dữ liệu trả về:', res?.data?.data);
          return;
        }
        const parsed = parseMatchDataArray(raw);
        console.log(`[API] Số trận lấy từ API: ${parsed.length}`);
        setMatches(parsed);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
      }
    };
  
    fetchData();
    const interval = setInterval(fetchData, 30000);

    useMQTTStore.getState().connect();
  
    // connectMQTT((message) => {
    //   console.log('[MQTT] Message received:', message);
    //   const liveMatches = parseMatchDataArray(message);
    
    //   setMatches((prevMatches) => {
    //     const matchMap = new Map(prevMatches.map((m) => [m.id, m]));
    
    //     for (const m of liveMatches) {
    //       matchMap.set(m.id, m); // ghi đè nếu trùng ID
    //     }
    
    //     return Array.from(matchMap.values());
    //   });
    // });    
  
    return () => {
      clearInterval(interval);
      // disconnectMQTT();
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    const liveMatches = parseMatchDataArray(latestMessage);

    setMatches((prevMatches) => {
      const matchMap = new Map(prevMatches.map((m) => [m.id, m]));

      for (const m of liveMatches) {
        matchMap.set(m.id, m);
      }

      return Array.from(matchMap.values());
    });
  }, [messages]);
  
  const filteredMatches = matches.filter((match) => {
    switch (selectedTab) {
      case 'All':
        return true;
      case 'Live':
        return match.statusCode === 1;
      case 'Ended':
        return match.statusCode === 3;
      default:
        return true;
    }
  });

  const getMatchTimeDisplay = (match: any) => {
    const start = dayjs.unix(match.startTimestamp);
    return `${start.format('DD/MM')}
${start.format('HH:mm')}`;
  };

  const getTextColor = (match: any) => {
    if ((match.statusCode === 5 || match.statusCode === 7) && match.period === 'HT') return 'limegreen';
    return 'white';
  };

  const grouped = filteredMatches.reduce((acc: any, match: any) => {
    const groupKey = `${match.tournament.category.name} - ${match.tournament.name}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(match);
    return acc;
  }, {});

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-lg ${
              selectedTab === tab ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-gray-400 text-center">Không có trận nào.</div>
      ) : (
        Object.keys(grouped).map((group) => (
          <div key={group} className="mb-6">
            <div className="text-lg font-bold mb-2">{group}</div>
            {grouped[group].map((match: any) => (
              <div
                key={match.id}
                className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 rounded-lg mb-2"
              >
                <div className="text-sm" style={{ whiteSpace: 'pre-line', color: getTextColor(match) }}>
                  {getMatchTimeDisplay(match)}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div>{match.homeTeam.name}</div>
                    <div>{match.awayTeam.name}</div>
                  </div>
                  <div className="text-right text-sm text-gray-300">
                    <div>{match.homeScore.display}</div>
                    <div>{match.awayScore.display}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default FootballMatchesPage;