import BackIcon from "@/components/icons/BackIcon";
import { uploadFile } from "@/utils/file";
import {
  Button,
  Checkbox,
  FileInput,
  Label,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { MdArrowBackIos, MdCancel } from "react-icons/md";
import { loadGoogleMaps } from "../../utils/loadGoogleMaps";
import { toast } from "react-toastify";

export default function Settings({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [specialityList, setSpecialityList] = useState([]);
  const [display, setDisplay] = useState("Profile");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentType, setDocumentType] = useState("Aadhar Card");
  const [documentFront, setDocumentFront] = useState(null);
  const [documentBack, setDocumentBack] = useState(null);
  const [documentFrontUrl, setDocumentFrontUrl] = useState("");
  const [documentBackUrl, setDocumentBackUrl] = useState("");
  const [documents, setDocuments] = useState([]);
  
  // Document upload handlers
  const handleDocumentUpload = async (side, file) => {
    if (!file) return;
    
    try {
      setLoading(true);
      const uploadedUrl = await uploadFile({
        file: file,
        path: "vendor-documents/",
        id: `${new Date().getTime()}-${side}-document`
      });
      
      if (side === 'front') {
        setDocumentFrontUrl(uploadedUrl);
      } else {
        setDocumentBackUrl(uploadedUrl);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }
    
    if (!documentFrontUrl || !documentBackUrl) {
      toast.error('Please upload both front and back images');
      return;
    }

    // Create document object according to the model
    const newDocument = {
      name: documentType,
      front: { 
        url: documentFrontUrl,
        uploadedAt: new Date(),
        fileSize: documentFront?.size || 0
      },
      back: { 
        url: documentBackUrl,
        uploadedAt: new Date(),
        fileSize: documentBack?.size || 0
      },
      status: "pending",
      verifiedAt: null,
      rejectionReason: ""
    };

    try {
      setLoading(true);
      
      // Send document to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          documents: [newDocument]
        }),
      });

      const result = await response.json();
      
      if (result.message === "success") {
        // Update local state
        setDocuments([newDocument]);
        toast.success('Document uploaded successfully!');
        
        // Close modal and reset
        setShowDocumentModal(false);
        setDocumentFrontUrl("");
        setDocumentBackUrl("");
        setDocumentFront(null);
        setDocumentBack(null);
        setDocumentType("Aadhar Card");
      } else {
        toast.error('Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [profile, setProfile] = useState({
    businessName: "",
    businessDescription: "",
    speciality: "",
    servicesOffered: "",
    groomMakeup: false,
    onlyHairStyling: false,
  });
  const [address, setAddress] = useState({
    place_id: "",
    formatted_address: "",
    address_components: [],
    city: "",
    postal_code: "",
    locality: "",
    state: "",
    country: "",
    geometry: {
      location: {
        lat: 0,
        lng: 0,
      },
    },
  });
  const [locationData, setLocationData] = useState([]);
  const [prices, setPrices] = useState({
    party: 0,
    bridal: 0,
    groom: 0,
  });
  const [gallery, setGallery] = useState({
    coverPhoto: "",
    photos: [],
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [photo, setPhoto] = useState(null);
  const coverPhotoRef = useRef();
  const photoRef = useRef();
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [googleInstance, setGoogleInstance] = useState(null);
  const [other, setOther] = useState({
    groomMakeup: false,
    lgbtqMakeup: false,
    experience: "",
    clients: "",
    usp: "",
    makeupProducts: [],
    awards: [],
  });
  const fetchSpecialityList = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-speciality`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setSpecialityList(response);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchOther = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=other`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setOther(response.other);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchProfile = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setProfile({
            ...profile,
            ...response,
            servicesOffered:
              JSON.stringify(response.servicesOffered) ===
              JSON.stringify(["Hairstylist", "MUA"])
                ? "Both"
                : response.servicesOffered[0] || "",
          });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchAddress = () => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=businessAddress`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setAddress({ ...address, ...response });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchGallery = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=gallery`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setGallery({ ...response.gallery, temp: response.temp });
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchLocationData = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/location`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false);
        let tempList = response;
        let states = tempList.filter((i) => i.locationType === "State");
        let cities = tempList.filter((i) => i.locationType === "City");
        let areas = tempList.filter((i) => i.locationType === "Area");
        let pincodes = tempList.filter((i) => i.locationType === "Pincode");
        Promise.all(
          states.map((i) => {
            return new Promise((resolve, reject) => {
              let tempCities = cities.filter((j) => j.parent == i._id);
              Promise.all(
                tempCities.map((j) => {
                  return new Promise((resolve1, reject1) => {
                    let tempAreas = areas.filter((k) => k.parent == j._id);
                    Promise.all(
                      tempAreas.map((k) => {
                        return new Promise((resolve2, reject1) => {
                          let tempPincodes = pincodes.filter(
                            (l) => l.parent == k._id
                          );
                          resolve2({ ...k, pincodes: tempPincodes });
                        });
                      })
                    ).then((result) => resolve1({ ...j, areas: result }));
                  });
                })
              ).then((result) => resolve({ ...i, cities: result }));
            });
          })
        ).then((result) => setLocationData(result));
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const fetchPrices = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=prices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setPrices(response.prices);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const fetchDocuments = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=documents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          router.push("/login");
          return;
        } else {
          return response.json();
        }
      })
      .then((response) => {
        if (response) {
          setLoading(false);
          setDocuments(response.documents || []);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateOther = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        other,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchOther();
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error updating details.");
        } else if (!user?.profileCompleted) {
          setDisplay("Prices");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updatePrices = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(
        user?.profileCompleted === false
          ? {
              prices,
              profileCompleted: true,
            }
          : {
              prices,
            }
      ),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchPrices();
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error updating photo details.");
        } else if (!user?.profileCompleted) {
          setDisplay("Gallery");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const updateCoverPhoto = async () => {
    let tempImage = await uploadFile({
      file: coverPhoto,
      path: "vendor-gallery/",
      id: `${new Date().getTime()}-${gallery.temp}-coverphoto`,
    });
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        gallery: { coverPhoto: tempImage },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchGallery();
        setCoverPhoto("");
        coverPhotoRef.current.value = null;
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error updating photo details.");
        } else {
          toast.success("Cover photo uploaded successfully!");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Failed to upload cover photo. Please try again.");
      });
  };

  const handleDeleteCoverPhoto = async () => {
    if (loading) return;
    
    // Show confirmation toast with action buttons
    const toastId = toast(
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900">Delete Cover Photo</p>
        <p className="text-sm text-gray-600">Are you sure you want to delete the cover photo?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(toastId);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastId);
              await deleteCoverPhoto();
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const deleteCoverPhoto = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          gallery: { coverPhoto: "" },
        }),
      });

      const result = await response.json();
      
      if (result.message === "success") {
        fetchGallery();
        toast.success("Cover photo deleted successfully!");
      } else {
        toast.error("Error deleting cover photo.");
      }
    } catch (error) {
      console.error("Error deleting cover photo:", error);
      toast.error("Failed to delete cover photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const updatePhoto = async () => {
    let tempImage = await uploadFile({
      file: photo,
      path: "vendor-gallery/",
      id: `${new Date().getTime()}-${gallery.temp}-photo-${
        gallery.photos.length
      }`,
    });
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        gallery: { photos: [...gallery?.photos, tempImage] },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchGallery();
        setPhoto("");
        photoRef.current.value = null;
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error updating price details.");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleMultiplePhotoUpload = async (files) => {
    if (gallery.photos.length + files.length > 6) {
      toast.error("Maximum 6 photos allowed. Please select fewer files.");
      return;
    }

    setLoading(true);
    const uploadPromises = files.map((file, index) => 
      uploadFile({
        file: file,
        path: "vendor-gallery/",
        id: `${new Date().getTime()}-${gallery.temp}-photo-${gallery.photos.length + index}`,
      })
    );

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...gallery.photos, ...uploadedUrls];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          gallery: { photos: newPhotos },
        }),
      });

      const result = await response.json();
      
      if (result.message === "success") {
        fetchGallery();
        toast.success(`${files.length} photo(s) uploaded successfully!`);
      } else {
        toast.error("Error uploading photos.");
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos. Please try again.");
    } finally {
      setLoading(false);
      photoRef.current.value = null;
    }
  };

  const handleDeletePhoto = async (index) => {
    if (loading) return;
    
    // Show confirmation toast with action buttons
    const toastId = toast(
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900">Delete Photo</p>
        <p className="text-sm text-gray-600">Are you sure you want to delete this photo?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(toastId);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastId);
              await deletePhoto(index);
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const deletePhoto = async (index) => {
    setLoading(true);
    const updatedPhotos = gallery.photos.filter((_, i) => i !== index);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          gallery: { photos: updatedPhotos },
        }),
      });

      const result = await response.json();
      
      if (result.message === "success") {
        fetchGallery();
        toast.success("Photo deleted successfully!");
      } else {
        toast.error("Error deleting photo.");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        businessAddress: address,
        businessName: profile.businessName,
        businessDescription: profile.businessDescription,
        speciality: profile.speciality,
        servicesOffered:
          profile.servicesOffered === "Both"
            ? ["Hairstylist", "MUA"]
            : [profile.servicesOffered],
        other: {
          groomMakeup: profile.groomMakeup,
          onlyHairStyling: profile.onlyHairStyling,
        },
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        fetchAddress();
        fetchProfile();
        setLoading(false);
        if (response.message !== "success") {
          toast.error("Error updating details.");
        } else if (!user?.profileCompleted) {
          setDisplay("About you");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  const extractAddressComponents = (components) => {
    const result = {
      city: "",
      postal_code: "",
      state: "",
      country: "",
      locality: "",
    };

    components.forEach((component) => {
      if (component.types.includes("locality")) {
        result.city = component.long_name; // Locality usually represents the city
      }
      if (
        component.types.includes("administrative_area_level_2") &&
        !result.city
      ) {
        result.city = component.long_name; // Fallback if locality isn't available
      }
      if (component.types.includes("postal_code")) {
        result.postal_code = component.long_name; // Extract postal code
      }
      if (component.types.includes("administrative_area_level_1")) {
        result.state = component.long_name; // Extract state
      }
      if (component.types.includes("country")) {
        result.country = component.long_name; // Extract country
      }
      if (
        component.types.includes("sublocality") ||
        component.types.includes("neighborhood")
      ) {
        result.locality = component.long_name; // More granular locality info
      }
    });

    return result;
  };

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        let google = null;
        if (!isLoaded) {
          google = await loadGoogleMaps(); // Load Google Maps API
          setGoogleInstance(google);
          setIsLoaded(true);
        } else {
          google = googleInstance;
        }
        if (!google?.maps) {
          throw new Error("Google Maps library is not loaded properly.");
        }
        // Check if inputRef.current exists before initializing Autocomplete
        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["geocode"], // Restrict results to addresses only
            }
          );
          // Listen for place selection
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              const { city, postal_code, state, country, locality } =
                extractAddressComponents(place.address_components);
              setAddress((prevItems) => {
                return {
                  ...prevItems,
                  city,
                  postal_code,
                  state,
                  country,
                  locality,
                  place_id: place.place_id,
                  formatted_address: place.formatted_address,
                  geometry: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  },
                };
              });
            }
          });
        } else {
          console.warn("Input reference is not available yet.");
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };
    if (display === "Profile") {
      initializeAutocomplete();
    }
  }, [display]);
  useEffect(() => {
    fetchLocationData();
    fetchPrices();
    fetchGallery();
    fetchOther();
    fetchAddress();
    fetchProfile();
    fetchSpecialityList();
    fetchDocuments();
  }, []);
  return (
    <>
      <div className="flex flex-col py-4 pt-8 overflow-x-hidden">
        <div className="flex flex-row gap-3 items-center mb-4 px-8">
          <BackIcon />
        </div>
        <div className="flex flex-row items-center mb-6 border-b border-gray-200 overflow-x-hidden">
          <div
            className={`font-semibold text-sm py-3 px-6 text-center flex-grow border-b-2 transition-colors ${
              display === "Profile" 
                ? "text-[#840032] border-[#840032]" 
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
            onClick={() => {
              setDisplay("Profile");
            }}
          >
            Profile
          </div>
          <div
            className={`font-semibold text-sm py-3 px-6 text-center flex-grow border-b-2 transition-colors whitespace-nowrap ${
              display === "About you" 
                ? "text-[#840032] border-[#840032]" 
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
            onClick={() => {
              setDisplay("About you");
            }}
          >
            About you
          </div>
          <div
            className={`font-semibold text-sm py-3 px-6 text-center flex-grow border-b-2 transition-colors ${
              display === "Prices" 
                ? "text-[#840032] border-[#840032]" 
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
            onClick={() => {
              setDisplay("Prices");
            }}
          >
            Prices
          </div>
          <div
            className={`font-semibold text-sm py-3 px-6 text-center flex-grow border-b-2 transition-colors ${
              display === "Gallery" 
                ? "text-[#840032] border-[#840032]" 
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
            onClick={() => {
              setDisplay("Gallery");
            }}
          >
            Gallery
          </div>
        </div>
        {display === "Profile" && (
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden">
            {/* Profile Details Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Display name / Business Name
                </label>
                <input
                  type="text"
                placeholder="Display name / Business Name"
                value={profile.businessName}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    businessName: e.target.value,
                  });
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description about yourself (in 350 characters)
                </label>
                <textarea
                  placeholder="Share a little about your passion for makeup and what drives you as an artist..."
                  rows={4}
                value={profile.businessDescription}
                onChange={(e) => {
                    if (e.target.value.length <= 350) {
                  setProfile({
                    ...profile,
                    businessDescription: e.target.value,
                  });
                    }
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] resize-none"
              />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {profile.businessDescription.length}/350 characters
            </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Speciality in (eg: south indian, muslim etc.)
                </label>
                <select
                value={profile.speciality}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    speciality: e.target.value,
                  });
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
              >
                  <option value="">Select</option>
                {specialityList?.map((t) => (
                  <option key={t._id} value={t.title}>
                    {t.title}
                  </option>
                ))}
                </select>
            </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Services you provide
                </label>
                <select
                value={profile.servicesOffered}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    servicesOffered: e.target.value,
                  });
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032]"
              >
                <option value="">Select Option</option>
                <option value={"Hairstylist"}>Hairstylist</option>
                <option value={"MUA"}>MUA</option>
                <option value={"Both"}>Both</option>
                </select>
            </div>

              {profile.servicesOffered !== "Hairstylist" && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Do you take up Groom Makeup?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="groomMakeup"
                    checked={profile.groomMakeup === true}
                    onChange={(e) => {
                      setProfile({
                        ...profile,
                            groomMakeup: true,
                      });
                    }}
                    disabled={loading}
                        className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                      />
                      <span className="text-sm text-black">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="groomMakeup"
                    checked={profile.groomMakeup === false}
                    onChange={(e) => {
                      setProfile({
                        ...profile,
                            groomMakeup: false,
                      });
                    }}
                    disabled={loading}
                        className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                  />
                      <span className="text-sm text-black">No</span>
                    </label>
                </div>
              </div>
              )}

              {profile.servicesOffered !== "Hairstylist" && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Do you take up only Hair Styling?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="onlyHairStyling"
                    checked={profile.onlyHairStyling === true}
                    onChange={(e) => {
                      setProfile({
                        ...profile,
                            onlyHairStyling: true,
                      });
                    }}
                    disabled={loading}
                        className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                      />
                      <span className="text-sm text-black">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="onlyHairStyling"
                    checked={profile.onlyHairStyling === false}
                    onChange={(e) => {
                      setProfile({
                        ...profile,
                            onlyHairStyling: false,
                      });
                    }}
                    disabled={loading}
                        className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                  />
                      <span className="text-sm text-black">No</span>
                    </label>
                </div>
              </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 my-6"></div>

            {/* Address Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Address details</h3>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  readOnly
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  State
                </label>
                <div className="relative">
                  <select
                    value={address.state}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black focus:outline-none focus:ring-0 focus:border-[#840032] appearance-none bg-gray-50"
                  >
                    <option value="">Select State</option>
                    {locationData?.map((state) => (
                      <option key={state._id} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Flat no/House no
                </label>
                <input
                  type="text"
                  placeholder="Flat no/House no"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address.formatted_address}
                  onChange={(e) => {
                    setAddress({
                      ...address,
                      formatted_address: e.target.value,
                    });
                  }}
                  ref={inputRef}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.postal_code}
                  readOnly
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Google maps address
                </label>
                <input
                  type="text"
                  placeholder="Google maps address"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                />
              </div>
                
              {/* address proof */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Upload address proof
                </label>
                
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{doc.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Front</p>
                            {doc.front?.url ? (
                              <img src={doc.front.url} alt="Front" className="w-16 h-10 object-cover rounded border" />
                            ) : (
                              <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-400">No image</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Back</p>
                            {doc.back?.url ? (
                              <img src={doc.back.url} alt="Back" className="w-16 h-10 object-cover rounded border" />
                            ) : (
                              <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-400">No image</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {doc.status === 'rejected' && doc.rejectionReason && (
                          <p className="text-xs text-red-600 mt-2">Reason: {doc.rejectionReason}</p>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                  disabled={loading}
                      onClick={() => setShowDocumentModal(true)}
                      className="w-full px-4 py-2 border border-[#840032] text-[#840032] rounded-lg hover:bg-[#840032] hover:text-white transition-colors text-sm"
                    >
                      Update Document
                    </button>
              </div>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowDocumentModal(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-[#840032] rounded-lg text-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    + Upload address proof
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">Aadhar card / Driving license / Passport</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                  onClick={() => {
                    if (profile.businessDescription.length > 350) {
                    toast.error("The profile can have a maximum of 350 Characters.");
                    } else {
                      updateProfile();
                    }
                  }}
                disabled={loading}
                className="w-full py-4 bg-[#840032] text-white font-semibold rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {user?.profileCompleted ? "Submitting..." : "Saving..."}
                  </>
                ) : (
                  user?.profileCompleted ? "Submit" : "Next"
                )}
              </button>
            </div>
          </div>
        )}
        {display === "About you" && (
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden">
            {/* Experience Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                How many years of experience?
              </label>
              <input
                type="number"
                placeholder="5"
                value={other.experience}
                onChange={(e) => {
                  setOther({
                    ...other,
                    experience: e.target.value,
                  });
                }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>

            {/* Clients Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                How many clients have you served till date?
              </label>
              <p className="text-xs text-gray-500 mb-2">(approx. number)</p>
              <input
                type="number"
                placeholder="50"
                value={other.clients}
                onChange={(e) => {
                  setOther({
                    ...other,
                    clients: e.target.value,
                  });
                }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>

            {/* Certificates/Awards Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-4">
                Certificate/Awards that you have received
              </label>
              
              {/* Awards List */}
              <div className="space-y-4">
                {other?.awards?.map((award, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-2 items-center mb-3">
                      <input
                        type="text"
                        placeholder="Award/Certificate Title"
                        value={award.title || ""}
                    onChange={(e) => {
                          const newAwards = [...(other?.awards || [])];
                          newAwards[index] = { ...newAwards[index], title: e.target.value };
                      setOther({
                        ...other,
                            awards: newAwards,
                      });
                    }}
                    disabled={loading}
                        className="flex-1 px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
                  />
                      <button
                        type="button"
                    onClick={() => {
                          const newAwards = other?.awards?.filter((_, i) => i !== index) || [];
                      setOther({
                        ...other,
                            awards: newAwards,
                      });
                    }}
                        className="w-12 h-12 border-2 border-red-500 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-xl font-bold">×</span>
                      </button>
                    </div>
                    
                    {/* Certificate Upload */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Image
                      </label>
                      {award.certificate ? (
                        <div className="relative inline-block">
                          <img
                            src={award.certificate}
                            alt="Certificate"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAwards = [...(other?.awards || [])];
                              newAwards[index] = { ...newAwards[index], certificate: "" };
                              setOther({
                                ...other,
                                awards: newAwards,
                              });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  setLoading(true);
                                  const uploadedUrl = await uploadFile({
                                    file: file,
                                    path: "vendor-certificates/",
                                    id: `${new Date().getTime()}-certificate-${index}`
                                  });
                                  
                                  const newAwards = [...(other?.awards || [])];
                                  newAwards[index] = { ...newAwards[index], certificate: uploadedUrl };
                                  setOther({
                                    ...other,
                                    awards: newAwards,
                                  });
                                  
                                  toast.success('Certificate uploaded successfully!');
                                } catch (error) {
                                  console.error('Error uploading certificate:', error);
                                  toast.error('Failed to upload certificate. Please try again.');
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="hidden"
                            id={`certificate-upload-${index}`}
                          />
                          <label
                            htmlFor={`certificate-upload-${index}`}
                            className="cursor-pointer flex flex-col items-center justify-center py-4"
                          >
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="text-sm text-gray-600">Click to upload certificate</p>
                          </label>
                        </div>
                      )}
                    </div>
                </div>
              ))}
              </div>

              {/* Add Award Button */}
              <button
                type="button"
                onClick={() => {
                  setOther({
                    ...other,
                    awards: [...(other?.awards || []), { title: "", certificate: "" }],
                  });
                }}
                className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Add Award/Certificate <span className="text-lg">+</span>
              </button>
              </div>

            {/* Makeup Products Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-4 text-center">
                Mention the Makeup Products that you use
              </label>
              <div className="flex gap-4">
                {/* Input Lines Section */}
                <div className="flex-1 space-y-4">
              {other?.makeupProducts?.map((item, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                    value={item}
                    onChange={(e) => {
                          let temp = [...(other?.makeupProducts || [])];
                      temp[index] = e.target.value;
                      setOther({
                        ...other,
                        makeupProducts: temp,
                      });
                    }}
                    disabled={loading}
                        className="w-full border-0 border-b-2 border-gray-300 pb-2 bg-transparent focus:outline-none focus:border-[#840032] focus:ring-0 text-black placeholder-gray-400"
                        placeholder={`Product ${index + 1}`}
                  />
                      <button
                        type="button"
                    onClick={() => {
                          const newProducts = other?.makeupProducts?.filter((_, i) => i !== index) || [];
                      setOther({
                        ...other,
                            makeupProducts: newProducts,
                      });
                    }}
                        className="absolute right-0 top-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                </div>
              ))}
                  {/* Add empty lines if less than 3 products */}
                  {other?.makeupProducts?.length < 3 && (
                    Array.from({ length: 3 - (other?.makeupProducts?.length || 0) }).map((_, index) => (
                      <div key={`empty-${index}`} className="relative">
                        <input
                          type="text"
                          value=""
                          onChange={(e) => {
                            const newProducts = [...(other?.makeupProducts || [])];
                            newProducts.push(e.target.value);
                            setOther({
                              ...other,
                              makeupProducts: newProducts,
                            });
                          }}
                          disabled={loading}
                          className="w-full border-0 border-b-2 border-gray-300 pb-2 bg-transparent focus:outline-none focus:border-[#840032] focus:ring-0 text-black placeholder-gray-400"
                          placeholder={`Product ${(other?.makeupProducts?.length || 0) + index + 1}`}
                        />
                      </div>
                    ))
                  )}
                </div>
                
                {/* Buttons Section */}
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                onClick={() => {
                      if ((other?.makeupProducts?.length || 0) < 3) {
                  setOther({
                    ...other,
                          makeupProducts: [...(other?.makeupProducts || []), ""],
                        });
                      } else {
                        toast.error("Maximum 3 products allowed");
                      }
                    }}
                    disabled={(other?.makeupProducts?.length || 0) >= 3}
                    className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                      (other?.makeupProducts?.length || 0) >= 3
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-800"
                    }`}
                  >
                    Add more <span className="text-lg">+</span>
                  </button>
                  <div className="text-xs text-gray-500 text-center">
                    {(other?.makeupProducts?.length || 0)}/3 products
              </div>
            </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  updateOther();
                }}
                disabled={loading}
                className="w-full py-3 bg-[#840032] text-white font-semibold rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Done'
                )}
              </button>
            </div>

            {/* LGBTQ Question */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Do you also offer makeup to LGBTQ?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lgbtqMakeup"
                    checked={other.lgbtqMakeup === true}
                    onChange={(e) => {
                      setOther({
                        ...other,
                        lgbtqMakeup: true,
                      });
                    }}
                    disabled={loading}
                    className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                  />
                  <span className="text-sm text-black">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lgbtqMakeup"
                    checked={other.lgbtqMakeup === false}
                    onChange={(e) => {
                      setOther({
                        ...other,
                        lgbtqMakeup: false,
                      });
                    }}
                    disabled={loading}
                    className="w-4 h-4 text-[#840032] border-2 border-gray-300 focus:ring-[#840032]"
                  />
                  <span className="text-sm text-black">No</span>
                </label>
                </div>
              </div>

            {/* USP Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                How are you different from other artist?
              </label>
              <textarea
                placeholder="I specialize in creating customized bridal looks that enhance natural beauty while ensuring long-lasting results, using only high-quality, cruelty-free products. My signature style focuses on glowing, radiant skin and timeless elegance, making every client feel confident and camera-ready."
                rows={4}
                value={other.usp}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                  setOther({
                    ...other,
                    usp: e.target.value,
                  });
                  }
                }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 italic focus:outline-none focus:ring-0 focus:border-[#840032] resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <div className={`text-xs ${other.usp.length < 500 ? 'text-red-500' : other.usp.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                  {other.usp.length < 500 ? `Minimum 500 characters required (${other.usp.length}/500)` : 
                   other.usp.length > 1000 ? `Maximum 1000 characters allowed (${other.usp.length}/1000)` :
                   `${other.usp.length}/1000 characters`}
            </div>
                <div className={`text-xs ${other.usp.length >= 500 && other.usp.length <= 1000 ? 'text-green-600' : 'text-gray-400'}`}>
                  {other.usp.length >= 500 && other.usp.length <= 1000 ? '✓ Valid' : 'Invalid'}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={() => {
                  if (other.usp.length >= 500 && other.usp.length <= 1000) {
                    updateOther();
                  } else if (other.usp.length > 1000) {
                    toast.error(
                      "How are you different from other artist can have a maximum of 1000 characters."
                    );
                  } else if (other.usp.length < 500) {
                    toast.error(
                      "How are you different from other artist should have a minimum of 500 characters."
                    );
                  }
                }}
                disabled={!other.experience || !other.clients || !other.usp || other.usp.length < 500 || other.usp.length > 1000}
                className="w-full py-4 bg-[#840032] text-white font-semibold rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {user?.profileCompleted ? "Submitting..." : "Saving..."}
                  </>
                ) : (
                  user?.profileCompleted ? "Submit" : "Next"
                )}
              </button>
            </div>
          </div>
        )}
        {display === "Prices" && (
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden">
            {/* Bridal Makeup Price */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Bridal makeup Starting price
              </label>
              <input
                type="number"
                placeholder="Bridal makeup Starting price"
                value={prices.bridal}
                onChange={(e) => {
                  setPrices({
                    ...prices,
                    bridal: e.target.value,
                  });
                }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>

            {/* Party Makeup Price */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Party makeup starting price (optional)
              </label>
              <input
                type="number"
                placeholder="Party makeup Starting price"
                value={prices.party}
                onChange={(e) => {
                  setPrices({
                    ...prices,
                    party: e.target.value,
                  });
                }}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>

            {/* Groom Makeup Price - Only show if services include makeup AND groom makeup is selected */}
            {profile.servicesOffered !== "Hairstylist" && profile.groomMakeup && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Groom makeup starting price
                </label>
                <input
                  type="number"
                placeholder="Groom makeup Starting price"
                value={prices.groom}
                onChange={(e) => {
                  setPrices({
                    ...prices,
                    groom: e.target.value,
                  });
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-[#840032] rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032]"
              />
            </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={() => {
                  updatePrices();
                }}
                disabled={!prices.bridal || (profile.servicesOffered !== "Hairstylist" && profile.groomMakeup && !prices.groom)}
                className="w-full py-4 bg-[#840032] text-white font-semibold rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {user?.profileCompleted ? "Submitting..." : "Saving..."}
                  </>
                ) : (
                  user?.profileCompleted ? "Submit" : "Next"
                )}
              </button>
            </div>
          </div>
        )}
        {display === "Gallery" && (
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden">
            {/* Cover Photo Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Upload Profile cover photo
              </label>
              <p className="text-xs text-gray-500 mb-4">Portrait photo preferable (3:4 aspect ratio)</p>
              
              <div className="flex items-start gap-6">
                {/* Cover Photo Upload Area */}
                <div className="relative group">
                  {gallery.coverPhoto ? (
                    <div className="w-40 h-52 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={gallery.coverPhoto}
                        alt="Cover photo"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay with delete button */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCoverPhoto();
                          }}
                          disabled={loading}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-40 h-52 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:border-[#840032] hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => coverPhotoRef.current?.click()}
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-xs text-gray-500 text-center px-2">
                        Click to upload
                      </p>
                    </div>
                  )}
                  <input
              ref={coverPhotoRef}
                    type="file"
                    accept="image/*"
              onChange={(e) => {
                setCoverPhoto(e.target.files[0]);
              }}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
                
                {/* Info Panel */}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Cover Photo Guidelines</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Recommended size: 3:4 aspect ratio</li>
                      <li>• Portrait orientation preferred</li>
                      <li>• High quality, well-lit photo</li>
                      <li>• Professional appearance</li>
                    </ul>
                  </div>
                  
            {coverPhoto && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-800">Ready to upload</span>
                      </div>
                      <button
                onClick={() => {
                  updateCoverPhoto();
                }}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Cover Photo
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Photos Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-sm font-medium text-black">
                    Upload photos for gallery view
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload multiple images at once (max 6 photos)
                  </p>
                </div>
                <button
                  onClick={() => {
                    photoRef.current?.click();
                  }}
                  disabled={loading || gallery.photos.length >= 6}
                  className="px-4 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6d0028] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {gallery.photos.length >= 6 ? 'Max Reached' : 'Upload'}
                </button>
              </div>
              
              <input
              ref={photoRef}
                type="file"
                accept="image/*"
                multiple
              onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    handleMultiplePhotoUpload(files);
                  }
                }}
                className="hidden"
                disabled={loading || gallery.photos.length >= 6}
              />
              
              {/* Upload Progress */}
              {loading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-800">Uploading photos...</span>
                  </div>
                </div>
              )}
              
              {/* Gallery Grid */}
              <div className="grid grid-cols-2 gap-3">
              {gallery.photos.map((item, index) => (
                <div
                  key={index}
                    className="group relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={item}
                    alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeletePhoto(index)}
                      disabled={loading}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Image Number */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                </div>
              ))}
                
                {/* Upload Placeholder */}
                {gallery.photos.length < 6 && (
                  <div
                    onClick={() => photoRef.current?.click()}
                    className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#840032] hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-xs text-gray-500 text-center">
                      Click to add photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {gallery.photos.length}/6
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Upload Address Proof</h3>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdCancel size={24} />
                  </button>
                </div>

                {/* Document Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#840032]"
                  >
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                {/* Front Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Front Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setDocumentFront(file);
                        if (file) {
                          handleDocumentUpload('front', file);
                        }
                      }}
                      className="hidden"
                      id="front-upload"
                    />
                    <label
                      htmlFor="front-upload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4"
                    >
                      {documentFrontUrl ? (
                        <div className="relative">
                          <img
                            src={documentFrontUrl}
                            alt="Front document"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload front image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Back Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Back Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setDocumentBack(file);
                        if (file) {
                          handleDocumentUpload('back', file);
                        }
                      }}
                      className="hidden"
                      id="back-upload"
                    />
                    <label
                      htmlFor="back-upload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4"
                    >
                      {documentBackUrl ? (
                        <div className="relative">
                          <img
                            src={documentBackUrl}
                            alt="Back document"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm">Change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload back image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDocumentModal(false);
                      setDocumentFrontUrl("");
                      setDocumentBackUrl("");
                      setDocumentFront(null);
                      setDocumentBack(null);
                      setDocumentType("Aadhar Card");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDocument}
                    disabled={loading || !documentType || !documentFrontUrl || !documentBackUrl}
                    className="flex-1 px-4 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6d0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Uploading...' : 'Save Document'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
