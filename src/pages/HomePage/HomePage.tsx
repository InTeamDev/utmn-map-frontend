import React, { useState, useEffect } from "react";
import styles from "./HomePage.module.css";
import Dropdown, { DropdownOption } from "../../components/DropDown/DropDown";
import ImageCard from "../../components/ImageCard/ImageCard";
import Button from "../../components/Button/Button";
import { api } from "../../services/api";
import Error from "../../components/Error/Error";

const HomePage: React.FC = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState("Floor_First");
  const [locations, setLocations] = useState<{ [key: string]: string }>({});
  const [floorImage, setFloorImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const floors = {
    Floor_Fourth: "4",
    Floor_Third: "3",
    Floor_Second: "2",
    Floor_First: "1",
  };

  const buildings: { [key: string]: string } = {
    "улк 5": "Школа компьютерных наук",
  };

  const buildingOptions: DropdownOption[] = Object.keys(buildings).map(
    (key) => ({
      value: key,
      label: buildings[key],
    }),
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        const blob = await api.getFloorPlan("Floor_First");
        const url = URL.createObjectURL(blob);
        setFloorImage(url);
        const locationsData = await api.getObjects();
        setLocations(locationsData);
        setError(null);
      } catch (error) {
        setError("Не удалось загрузить данные. Пожалуйста, обновите страницу.");
        // TODO: replace console
        // console.error("Failed to initialize data:", error);
      }
    };

    initializeData();
  }, []);

  const getLocationOptions = () => {
    return Object.entries(locations)
      .filter(([key]) => {
        return !key.includes("IDK") && !key.includes("Stairs");
      })
      .map(([key, value]) => {
        const floor = key.split("_")[1];

        // Заменяем специальные названия
        const label = value
          .replace(/Toilet[^(]*/g, "Туалет") // Заменяем Toilet и всё после него до скобок на "Туалет"
          .replace("Gym", "Спортзал")
          .replace("Kitchen", "Кухня")
          .replace("Dining", "Столовая")
          .replace("Wardrobe", "Гардероб")
          .replace("First", "1")
          .replace("Second", "2")
          .replace("Third", "3")
          .replace("Fourth", "4");

        return {
          value: key,
          label,
          floor: parseInt(
            floor === "First"
              ? "1"
              : floor === "Second"
                ? "2"
                : floor === "Third"
                  ? "3"
                  : "4",
          ),
        };
      })
      .sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }

        const numA = parseInt(a.label.match(/\d+/)?.[0] || "");
        const numB = parseInt(b.label.match(/\d+/)?.[0] || "");

        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }

        return a.label.localeCompare(b.label);
      });
  };

  useEffect(() => {
    const updateRoute = async () => {
      try {
        const blob = await api.getFloorPlan(
          currentFloor,
          from || undefined,
          to || undefined,
        );
        const url = URL.createObjectURL(blob);

        if (floorImage) {
          URL.revokeObjectURL(floorImage);
        }

        setFloorImage(url);
        setError(null);
      } catch (error) {
        setError("Не удалось обновить маршрут. Попробуйте еще раз.");
        //console.error('Failed to update route:', error)
      }
    };

    updateRoute();
  }, [from, to, currentFloor, locations]);

  const handleFloorChange = async (floor: string) => {
    if (floor === currentFloor) return;

    try {
      const blob = await api.getFloorPlan(
        floor,
        from || undefined,
        to || undefined,
      );
      const url = URL.createObjectURL(blob);

      if (floorImage) {
        URL.revokeObjectURL(floorImage);
      }

      setFloorImage(url);
      setCurrentFloor(floor);
    } catch (error) {
      // console.error('Failed to fetch floor plan:', error)
    }
  };

  const handleFromChange = (value: string | null) => {
    if (!value) return;
    setFrom(value);
    const floor = value.split("_")[1];
    const floorKey = `Floor_${floor}`;
    if (floorKey !== currentFloor) {
      handleFloorChange(floorKey);
    }
  };

  const handleToChange = (value: string | null) => {
    if (!value) return;
    setTo(value);
    if (from !== null) {
      const floor = from.split("_")[1];
      const floorKey = `Floor_${floor}`;
      if (floorKey !== currentFloor) {
        handleFloorChange(floorKey);
      }
    }
  };

  const handleBuildignChange = (value: string | null) => {
    if (!value) return;
    setSelectedBuilding(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigationPanel}>
        {error && <Error message={error} />}
        {selectedBuilding && (
          <div className={styles.dropdownContainer}>
            <Dropdown
              options={getLocationOptions()}
              placeholder="Откуда?"
              onChange={handleFromChange}
            />
            <Dropdown
              options={getLocationOptions()}
              placeholder="Куда?"
              onChange={handleToChange}
            />
          </div>
        )}
        <div className={styles.buildingDropdownContainer}>
          <Dropdown
            options={buildingOptions}
            placeholder="Выбрать корпус"
            onChange={handleBuildignChange}
          />
        </div>
      </div>

      {selectedBuilding && (
        <div className={styles.content}>
          {floorImage && <ImageCard src={floorImage} alt="Floor Plan" />}
          <div className={styles.buttonContainer}>
            {Object.entries(floors)
              .reverse()
              .map(([apiFloor, displayText]) => (
                <Button
                  key={apiFloor}
                  text={displayText}
                  isActive={currentFloor === apiFloor}
                  onClick={() => handleFloorChange(apiFloor)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
