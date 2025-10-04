import BackIcon from "@/components/icons/BackIcon";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Avatar, Button, TextInput, Card } from "flowbite-react";
import { MdSearch, MdLocationOn, MdStar, MdPhone, MdEmail } from "react-icons/md";
import Link from "next/link";
import Head from "next/head";
import { toast } from "react-toastify";

export default function FindHairstylist() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState("");
  const [hairstylists, setHairstylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredHairstylists, setFilteredHairstylists] = useState([]);

  const fetchHairstylists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch hairstylists");
      }

      const data = await response.json();
      console.log("Hairstylists data:", data);
      setHairstylists(data);
      setFilteredHairstylists(data);
    } catch (error) {
      console.error("Error fetching hairstylists:", error);
      toast.error("Failed to load hairstylists. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterHairstylists = () => {
    let filtered = hairstylists;

    if (searchTerm) {
      filtered = filtered.filter(
        (hairstylist) =>
          hairstylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hairstylist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hairstylist.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter(
        (hairstylist) =>
          hairstylist.businessAddress?.city?.toLowerCase().includes(location.toLowerCase()) ||
          hairstylist.businessAddress?.area?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (services) {
      filtered = filtered.filter((hairstylist) =>
        hairstylist.servicesOffered?.some((service) =>
          service.toLowerCase().includes(services.toLowerCase())
        )
      );
    }

    setFilteredHairstylists(filtered);
  };

  useEffect(() => {
    fetchHairstylists();
  }, []);

  useEffect(() => {
    filterHairstylists();
  }, [searchTerm, location, services, hairstylists]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = async (text, type = "information") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy to clipboard", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleContactClick = (hairstylist) => {
    const contactInfo = [];
    if (hairstylist.phone) contactInfo.push(`Phone: ${hairstylist.phone}`);
    if (hairstylist.email) contactInfo.push(`Email: ${hairstylist.email}`);
    
    if (contactInfo.length > 0) {
      const contactText = `Contact ${hairstylist.businessName || hairstylist.name}:\n\n${contactInfo.join('\n')}`;
      
      toast.info(
        <div className="flex flex-col space-y-3">
          <div className="font-semibold text-gray-800">
            {hairstylist.businessName || hairstylist.name}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {contactInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
          
          {/* Individual Copy Buttons */}
          <div className="flex flex-row space-x-2">
            {hairstylist.phone && (
              <button
                onClick={() => copyToClipboard(hairstylist.phone, "Phone number")}
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors flex-1"
              >
                <MdPhone size={16} />
                <span>Copy Phone</span>
              </button>
            )}
            
            {hairstylist.email && (
              <button
                onClick={() => copyToClipboard(hairstylist.email, "Email address")}
                className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-600 transition-colors flex-1"
              >
                <MdEmail size={16} />
                <span>Copy Email</span>
              </button>
            )}
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      toast.warning("No contact information available", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Find Hairstylist - WEDSY</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Header */}
      <div className="sticky top-0 w-full flex flex-row items-center gap-3 px-4 sm:px-6 border-b py-3 shadow-lg bg-white z-10">
        <BackIcon />
        <p className="grow text-lg font-semibold text-custom-dark-blue">
          Find Hairstylist
        </p>
      </div>

      {/* Search Filters */}
      <div className="p-3 sm:p-4 bg-gray-50">
        <div className="space-y-3 sm:space-y-4">
          <TextInput
            icon={MdSearch}
            placeholder="Search by name, business, or speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              icon={MdLocationOn}
              placeholder="City or Area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
            <TextInput
              placeholder="Services (e.g., Bridal, Party)"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-dark-blue mb-4"></div>
            <p className="text-sm text-gray-600">Finding hairstylists...</p>
          </div>
        ) : filteredHairstylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600 mb-2">No Hairstylists Found</p>
              <p className="text-sm text-gray-500 mb-4">
                {hairstylists.length === 0 
                  ? "No hairstylists are available at the moment."
                  : "Try adjusting your search criteria."
                }
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setServices("");
                }}
                className="bg-custom-dark-blue"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {filteredHairstylists.length} hairstylist{filteredHairstylists.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="space-y-4">
              {filteredHairstylists.map((hairstylist, index) => (
                <Card key={hairstylist._id || index} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <Avatar
                      img={hairstylist.gallery?.profilePhoto || "/default-avatar.png"}
                      size="lg"
                      className="flex-shrink-0 mx-auto sm:mx-0"
                    />
                    
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <div className="text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {hairstylist.businessName || hairstylist.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {hairstylist.speciality || "Professional Hairstylist"}
                          </p>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start space-x-1 mt-1 sm:mt-0">
                          <MdStar className="text-yellow-400" size={16} />
                          <span className="text-sm font-medium">
                            {hairstylist.rating || "4.5"}
                          </span>
                        </div>
                      </div>
                      
                      {hairstylist.businessAddress && (
                        <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600 mb-3">
                          <MdLocationOn size={16} className="mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {[
                              hairstylist.businessAddress.area,
                              hairstylist.businessAddress.city,
                              hairstylist.businessAddress.state
                            ].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      
                      {hairstylist.servicesOffered && hairstylist.servicesOffered.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                            {hairstylist.servicesOffered.slice(0, 3).map((service, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                            {hairstylist.servicesOffered.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{hairstylist.servicesOffered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {hairstylist.prices && (
                        <div className="mb-4">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {hairstylist.prices.bridal > 0 && (
                              <div className="text-center">
                                <p className="text-gray-600 text-xs">Bridal</p>
                                <p className="font-semibold text-sm">{formatCurrency(hairstylist.prices.bridal)}</p>
                              </div>
                            )}
                            {hairstylist.prices.party > 0 && (
                              <div className="text-center">
                                <p className="text-gray-600 text-xs">Party</p>
                                <p className="font-semibold text-sm">{formatCurrency(hairstylist.prices.party)}</p>
                              </div>
                            )}
                            {hairstylist.prices.groom > 0 && (
                              <div className="text-center">
                                <p className="text-gray-600 text-xs">Groom</p>
                                <p className="font-semibold text-sm">{formatCurrency(hairstylist.prices.groom)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row justify-center sm:justify-start space-x-2">
                          {hairstylist.phone && (
                            <Button
                              size="sm"
                              color="light"
                              className="flex items-center justify-center space-x-1 flex-1 min-w-0"
                              onClick={() => {
                                window.open(`tel:${hairstylist.phone}`, '_self');
                              }}
                            >
                              <MdPhone size={14} className="flex-shrink-0" />
                              <span className="text-xs sm:text-sm">Call</span>
                            </Button>
                          )}
                          {hairstylist.email && (
                            <Button
                              size="sm"
                              color="light"
                              className="flex items-center justify-center space-x-1 flex-1 min-w-0"
                              onClick={() => {
                                window.open(`mailto:${hairstylist.email}?subject=Inquiry from WEDSY`, '_self');
                              }}
                            >
                              <MdEmail size={14} className="flex-shrink-0" />
                              <span className="text-xs sm:text-sm">Email</span>
                            </Button>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-custom-dark-blue w-full"
                          onClick={() => handleContactClick(hairstylist)}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
