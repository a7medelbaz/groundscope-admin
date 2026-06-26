import { createClient } from "@supabase/supabase-js";

const apiKey = process.env.AVIATIONSTACK_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!apiKey || !supabaseUrl || !anonKey) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(supabaseUrl, anonKey);

interface AviationStackFlight {
  flight_iataNumber?: string;
  flight_icaoNumber?: string;
  airline_iataCode?: string;
  departure_iataCode?: string;
  arrival_iataCode?: string;
  aircraft_iataCode?: string;
  aircraft_regNumber?: string;
  departure_scheduledTime?: string;
  arrival_scheduledTime?: string;
  status?: string;
}

export async function POST() {
  try {
    const params = new URLSearchParams();
    params.append("access_key", apiKey!);
    params.append("iataCode", "CAI");
    params.append("limit", "100");

    const [arrivalRes, departureRes] = await Promise.all([
      fetch(`https://api.aviationstack.com/v1/flights?${params}&type=arrival`),
      fetch(`https://api.aviationstack.com/v1/flights?${params}&type=departure`),
    ]);

    if (!arrivalRes.ok || !departureRes.ok) {
      return Response.json({ error: "Failed to fetch flights from AviationStack" }, { status: 400 });
    }

    const arrivalData = await arrivalRes.json();
    const departureData = await departureRes.json();

    const flights = [
      ...(arrivalData.data || []),
      ...(departureData.data || []),
    ]
      .filter((f: AviationStackFlight) => f.flight_iataNumber)
      .map((f: AviationStackFlight) => ({
        flight_number: f.flight_iataNumber || "",
        airline: f.airline_iataCode || "",
        origin: f.departure_iataCode || "",
        destination: f.arrival_iataCode || "",
        aircraft_type: f.aircraft_iataCode || undefined,
        aircraft_registration: f.aircraft_regNumber || undefined,
        scheduled_arrival: f.arrival_scheduledTime || new Date().toISOString(),
        status: mapFlightStatus(f.status),
        api_source: "aviationstack",
        external_id: f.flight_iataNumber,
        raw_data: f,
      }));

    const { error } = await (supabase as any)
      .from("flights")
      .upsert(flights, { onConflict: "external_id" });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, imported: flights.length }, { status: 200 });
  } catch (error) {
    console.error("[import-flights]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function mapFlightStatus(status?: string): string {
  const statusMap: Record<string, string> = {
    scheduled: "scheduled",
    active: "active",
    landed: "arrived",
    departed: "departed",
    cancelled: "cancelled",
  };
  return statusMap[status?.toLowerCase() || ""] || "scheduled";
}
