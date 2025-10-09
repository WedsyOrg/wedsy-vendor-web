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
import { toast } from "react-toastify";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function Settings({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dropdowns, setDropdowns] = useState({
    speciality: false,
    servicesOffered: false,
    state: false,
    documentType: false
  });
  const [specialityList, setSpecialityList] = useState([]);

  const toggleDropdown = (dropdownName) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const selectOption = (field, value, isAddress = false) => {
    if (isAddress) {
      setAddress(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setDropdowns(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Delete confirmation functions
  const showDeleteConfirmation = (type, index = null) => {
    setDeleteType(type);
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteType === 'cover') {
      await deleteCoverPhoto();
    } else if (deleteType === 'gallery' && deleteIndex !== null) {
      await deletePhoto(deleteIndex);
    }
    setShowDeleteModal(false);
    setDeleteType('');
    setDeleteIndex(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteType('');
    setDeleteIndex(null);
  };

  // Multi-select functions
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedPhotos([]);
    }
  };

  const togglePhotoSelection = (index) => {
    setSelectedPhotos(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(gallery.photos.map((_, index) => index));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos([]);
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;
    
    setLoading(true);
    const updatedPhotos = forceEmptyGallery ? [] : gallery.photos.filter((_, index) => !selectedPhotos.includes(index));

    try {
      const debugBody = { gallery: { photos: updatedPhotos } };
      console.debug("[Gallery/BulkDelete] Request", { selected: selectedPhotos.length, forceEmptyGallery, body: debugBody });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(debugBody),
      });

      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); } catch { result = { raw }; }
      console.debug("[Gallery/BulkDelete] Response", { status: response.status, ok: response.ok, result });
      
      if (result.message === "success") {
        // Update UI immediately
        setGallery((prev) => ({ ...prev, photos: updatedPhotos }));
        fetchGallery();
        toast.success(`${selectedPhotos.length} photo(s) deleted successfully!`);
        setSelectedPhotos([]);
        setIsMultiSelectMode(false);
        setForceEmptyGallery(false);
      } else {
        toast.error("Error deleting photos.");
      }
    } catch (error) {
      console.error("[Gallery/BulkDelete] Error", error);
      toast.error("Failed to delete photos.");
    } finally {
      setLoading(false);
      setShowBulkDeleteModal(false);
      setForceEmptyGallery(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  // Crop utility functions
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        2.5 / 3.5, // Passport size aspect ratio (2.5" x 3.5")
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg'
      );
      
      console.log('Cropped image blob:', croppedImageBlob);
      
      if (cropType === 'cover') {
        setCoverPhoto(croppedImageBlob);
        console.log('Set cover photo');
      } else if (cropType === 'gallery') {
        setCropFiles(prev => {
          const newFiles = [...prev, croppedImageBlob];
          console.log('Added to crop files. Total files:', newFiles.length);
          return newFiles;
        });
        
        // Auto-upload the cropped photo immediately
        console.log('Auto-uploading cropped photo...');
        uploadSingleCroppedPhoto(croppedImageBlob);
      }
      
      setShowCropModal(false);
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Error cropping image. Please try again.');
    }
  };

  const handleFileSelect = (file, type) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result);
        setCropType(type);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.select-field') && !event.target.closest('.dropdown-option')) {
        setDropdowns({
          speciality: false,
          servicesOffered: false,
          state: false,
          documentType: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
      // Handle error silently
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
      // Handle error silently
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
    flat_house_number: "",
    full_address: "",
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
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'cover' or 'gallery'
  const [deleteIndex, setDeleteIndex] = useState(null); // For gallery photos
  
  // Multi-select states for gallery
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [forceEmptyGallery, setForceEmptyGallery] = useState(false);
  const coverPhotoRef = useRef();
  const photoRef = useRef();
  const inputRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const googleInstanceRef = useRef(null);
  
  // Crop functionality states
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [imgSrc, setImgSrc] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropType, setCropType] = useState(''); // 'cover' or 'gallery'
  const [cropFiles, setCropFiles] = useState([]);
  const imgRef = useRef(null);
  const [other, setOther] = useState({
    groomMakeup: false,
    lgbtqMakeup: false,
    experience: "",
    clients: "",
    usp: "",
    makeupProducts: [""],
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
        // Handle error silently
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
          setOther({
            groomMakeup: response.other?.groomMakeup || false,
            lgbtqMakeup: response.other?.lgbtqMakeup || false,
            experience: response.other?.experience || "",
            clients: response.other?.clients || "",
            usp: response.other?.usp || "",
            makeupProducts: response.other?.makeupProducts?.length > 0 ? response.other?.makeupProducts : [""],
            awards: response.other?.awards || [],
          });
        }
      })
      .catch((error) => {
        // Handle error silently
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
            businessName: response.businessName || response.contactName || "",
            businessDescription: response.businessDescription || "",
            speciality: response.speciality || "",
            servicesOffered:
              JSON.stringify(response.servicesOffered) ===
              JSON.stringify(["Hairstylist", "MUA"])
                ? "Both"
                : response.servicesOffered?.[0] || response.serviceOffered || "",
            groomMakeup: response.groomMakeup || false,
            onlyHairStyling: response.onlyHairStyling || false,
          });
        }
      })
      .catch((error) => {
        // Handle error silently
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
          setAddress({
            place_id: response.place_id || "",
            formatted_address: response.formatted_address || response.address || "",
            address_components: response.address_components || [],
            city: response.city || "",
            postal_code: response.postal_code || response.pincode || "",
            locality: response.locality || "",
            state: response.state || "",
            country: response.country || "",
            geometry: response.geometry || {
              location: {
                lat: 0,
                lng: 0,
              },
            },
          });
        }
      })
      .catch((error) => {
        // Handle error silently
      });
  };
  const fetchGallery = () => {
    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/vendor?searchFor=gallery&_=${Date.now()}`;
    fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
          const coverPhoto = response?.gallery?.coverPhoto || "";
          const photos = Array.isArray(response?.gallery?.photos) ? response.gallery.photos : [];
          setGallery({ coverPhoto, photos, temp: response.temp || 'default' });
        }
      })
      .catch((error) => {
        // Handle error silently
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
        // Handle error silently
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
        // Handle error silently
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
        // Handle error silently
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
        } else {
          toast.success("Details Updated");
          if (!user?.profileCompleted) {
            setDisplay("Prices");
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Error updating details.");
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

  const handleDeleteCoverPhoto = () => {
    if (loading) return;
    showDeleteConfirmation('cover');
  };

  const deleteCoverPhoto = async () => {
    setLoading(true);
    try {
      const debugBody = { gallery: { coverPhoto: "" } };
      console.debug("[Gallery/DeleteCover] Request", {
        url: `${process.env.NEXT_PUBLIC_API_URL}/vendor/`,
        body: debugBody,
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(debugBody),
      });

      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); } catch { result = { raw }; }
      console.debug("[Gallery/DeleteCover] Response", { status: response.status, ok: response.ok, result });
      
      if (result.message === "success") {
        setGallery((prev) => ({ ...prev, coverPhoto: "" }));
        fetchGallery();
        toast.success("Cover photo deleted successfully!");
      } else {
        toast.error("Error deleting cover photo.");
      }
    } catch (error) {
        // Handle error silently
      console.error("[Gallery/DeleteCover] Error", error);
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
    if (gallery.photos.length + files.length > 15) {
      toast.error("Maximum 15 photos allowed. Please select fewer files.");
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

  // Handle single cropped photo upload
  const uploadSingleCroppedPhoto = async (croppedFile) => {
    if (gallery.photos.length >= 15) {
      toast.error("Maximum 15 photos allowed.");
      return;
    }

    console.log("Starting upload of single cropped photo");
    console.log("Current gallery photos:", gallery.photos.length);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Token exists:", !!localStorage.getItem("token"));
    
    setLoading(true);
    
    try {
      console.log("Uploading single file:", croppedFile);
      
      const uploadedUrl = await uploadFile({
        file: croppedFile,
        path: "vendor-gallery/",
        id: `${new Date().getTime()}-${gallery.temp || 'default'}-photo-${gallery.photos.length}`,
      });
      console.log("File uploaded successfully:", uploadedUrl);
      
      const newPhotos = [...gallery.photos, uploadedUrl];
      console.log("New photos array:", newPhotos);

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

      console.log("API Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.message === "success") {
        fetchGallery();
        // Remove the uploaded photo from cropFiles
        setCropFiles(prev => prev.filter(file => file !== croppedFile));
        toast.success("Photo uploaded successfully!");
      } else {
        toast.error("Error uploading photo: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setLoading(false);
      if (photoRef.current) {
        photoRef.current.value = null;
      }
    }
  };

  // Handle cropped files upload
  const handleCroppedFilesUpload = async () => {
    if (cropFiles.length === 0) {
      toast.error("No photos to upload.");
      return;
    }
    
    if (gallery.photos.length + cropFiles.length > 15) {
      toast.error("Maximum 15 photos allowed. Please select fewer files.");
      return;
    }

    console.log("Starting upload of", cropFiles.length, "cropped photos");
    console.log("Current gallery photos:", gallery.photos.length);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Token exists:", !!localStorage.getItem("token"));
    
    setLoading(true);
    
    try {
      // Upload files one by one to better handle errors
      const uploadedUrls = [];
      for (let i = 0; i < cropFiles.length; i++) {
        const file = cropFiles[i];
        console.log(`Uploading file ${i + 1}/${cropFiles.length}:`, file);
        
        try {
          const uploadedUrl = await uploadFile({
            file: file,
            path: "vendor-gallery/",
            id: `${new Date().getTime()}-${gallery.temp || 'default'}-photo-${gallery.photos.length + i}`,
          });
          console.log(`File ${i + 1} uploaded successfully:`, uploadedUrl);
          uploadedUrls.push(uploadedUrl);
        } catch (fileError) {
          console.error(`Error uploading file ${i + 1}:`, fileError);
          toast.error(`Failed to upload photo ${i + 1}. Please try again.`);
          throw fileError; // Stop the process if any file fails
        }
      }

      console.log("All files uploaded successfully. URLs:", uploadedUrls);
      
      const newPhotos = [...gallery.photos, ...uploadedUrls];
      console.log("New photos array:", newPhotos);

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

      console.log("API Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.message === "success") {
        fetchGallery();
        setCropFiles([]);
        toast.success(`Photo uploaded successfully!`);
      } else {
        toast.error("Error uploading photos: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos: " + error.message);
    } finally {
      setLoading(false);
      if (photoRef.current) {
        photoRef.current.value = null;
      }
    }
  };

  const handleDeletePhoto = (index) => {
    if (loading) return;
    showDeleteConfirmation('gallery', index);
  };

  const deletePhoto = async (index) => {
    setLoading(true);
    const updatedPhotos = gallery.photos.filter((_, i) => i !== index);

    try {
      const debugBody = { gallery: { photos: updatedPhotos } };
      console.debug("[Gallery/DeletePhoto] Request", { index, body: debugBody });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(debugBody),
      });

      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); } catch { result = { raw }; }
      console.debug("[Gallery/DeletePhoto] Response", { status: response.status, ok: response.ok, result });
      
      if (result.message === "success") {
        setGallery((prev) => ({ ...prev, photos: updatedPhotos }));
        fetchGallery();
        toast.success("Photo deleted successfully!");
      } else {
        toast.error("Error deleting photo.");
      }
    } catch (error) {
        // Handle error silently
      console.error("[Gallery/DeletePhoto] Error", error);
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

  // Google Maps Autocomplete functionality
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve(null);
      if (window.google && window.google.maps && window.google.maps.places) {
        return resolve(window.google);
      }
      const existing = document.getElementById("gmaps-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google));
        existing.addEventListener("error", () => resolve(null));
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      
      if (!apiKey) {
        console.warn("Google Maps API key not found. Google Maps autocomplete will be disabled.");
        return resolve(null);
      }
      
      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        console.warn("Failed to load Google Maps API. Autocomplete will be disabled.");
        resolve(null);
      };
      document.head.appendChild(script);
    });
  };

  // Helper to check if a place is within Bengaluru
  const isBengaluruAddress = (formattedAddress = "") => {
    const a = formattedAddress.toLowerCase();
    return a.includes("bengaluru") || a.includes("bangalore");
  };

  // Initialize Google Places Autocomplete
  useEffect(() => {
    let autocomplete;
    const init = async () => {
      try {
        const google = await loadGoogleMaps();
        if (!google?.maps?.places || !autocompleteInputRef.current) {
          console.log("Google Maps not available, autocomplete disabled");
          return;
        }
        googleInstanceRef.current = google;
        const center = new google.maps.LatLng(12.9716, 77.5946); // Bengaluru
        const circle = new google.maps.Circle({ center, radius: 60000 }); // 60km radius
        autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "place_id", "geometry"],
          strictBounds: true,
        });
        autocomplete.setBounds(circle.getBounds());

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place) return;
          const formatted = place.formatted_address || "";
          
          if (!isBengaluruAddress(formatted)) {
            toast.error("We currently support only Bengaluru addresses.");
            if (autocompleteInputRef.current) autocompleteInputRef.current.value = "";
            return;
          }
          
          // Extract address components
          const addressComponents = place.address_components || [];
          let state = "";
          let city = "";
          let area = "";
          let pincode = "";
          
          // Parse address components
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes("administrative_area_level_1")) {
              state = component.long_name;
            } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = component.long_name;
            } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
              area = component.long_name;
            } else if (types.includes("postal_code")) {
              pincode = component.long_name;
            }
          });
          
          // Additional check for pincode
          if (!pincode) {
            addressComponents.forEach(component => {
              const name = component.long_name || component.short_name || "";
              if (/^\d{6}$/.test(name)) {
                pincode = name;
              }
            });
          }
          
          // If pincode is not found, try to extract from formatted address
          if (!pincode) {
            const pincodePatterns = [
              /\b\d{6}\b/g,
              /\b\d{5,6}\b/g,
              /pincode[:\s]*(\d{6})/i,
              /pin[:\s]*(\d{6})/i,
            ];
            
            for (const pattern of pincodePatterns) {
              const match = formatted.match(pattern);
              if (match) {
                pincode = match[1] || match[0];
                break;
              }
            }
          }
          
          // Auto-fill address fields
          setAddress(prev => ({ 
            ...prev, 
            formatted_address: formatted,
            state: state || prev.state,
            city: city || prev.city,
            locality: area || prev.locality,
            postal_code: pincode || prev.postal_code,
            full_address: formatted,
            place_id: place.place_id || "",
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
            }
          }));
        });
      } catch (error) {
        console.warn("Google Maps initialization failed:", error);
      }
    };
    init();
    return () => {
      if (autocomplete) {
        try { googleInstanceRef.current?.maps?.event?.clearInstanceListeners(autocomplete); } catch (_) {}
      }
    };
  }, []);

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
      <style jsx>{`
        .select-field {
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          padding: 16px 20px;
          padding-right: 50px;
          font-size: 16px;
          color: #374151;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .select-field:focus {
          outline: none !important;
          border-color: #840032 !important;
          box-shadow: none !important;
        }
        .select-field:hover {
          border-color: #840032;
        }
        .dropdown-option {
          padding: 12px 16px;
          cursor: pointer;
          color: #374151;
          transition: background-color 0.2s;
        }
        .dropdown-option:hover {
          background-color: #F3F4F6;
        }
        .dropdown-option.selected {
          background-color: #FEF2F2;
          color: #840032;
        }
      `}</style>
      <div className="flex flex-col py-4 pt-8 overflow-x-hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="flex flex-row gap-3 items-center mb-4 px-8 pt-4">
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
        </div>
        {display === "Profile" && (
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden pt-24">
            {/* Profile Details Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Display name / Business Name
                </label>
                <input
                  type="text"
                placeholder="Display name / Business Name"
                value={profile.businessName || ""}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    businessName: e.target.value,
                  });
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description about yourself (in 350 characters)
                </label>
                <textarea
                  placeholder="Share a little about your passion for makeup and what drives you as an artist..."
                  rows={4}
                value={profile.businessDescription || ""}
                onChange={(e) => {
                    if (e.target.value.length <= 350) {
                  setProfile({
                    ...profile,
                    businessDescription: e.target.value,
                  });
                    }
                }}
                disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] resize-none transition-colors"
              />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {profile.businessDescription.length}/350 characters
            </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Speciality in (eg: south indian, muslim etc.)
                </label>
                <div className="relative">
                  <div
                    className="select-field"
                    onClick={() => toggleDropdown('speciality')}
                  >
                    {profile.speciality ? specialityList.find(opt => opt.title === profile.speciality)?.title : 'Select Speciality'}
                    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
                    </svg>
                  </div>
                  {dropdowns.speciality && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {specialityList?.map(option => (
                        <div
                          key={option._id}
                          className={`dropdown-option ${profile.speciality === option.title ? 'selected' : ''}`}
                          onClick={() => selectOption('speciality', option.title)}
                        >
                          {option.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Services you provide
                </label>
                <div className="relative">
                  <div
                    className="select-field"
                    onClick={() => toggleDropdown('servicesOffered')}
                  >
                    {profile.servicesOffered ? 
                      (profile.servicesOffered === 'MUA' ? 'MUA' : 
                       profile.servicesOffered === 'Hairstylist' ? 'Hairstylist' : 
                       profile.servicesOffered === 'Both' ? 'Both' : 'Select Service') 
                      : 'Select Service'}
                    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
                    </svg>
                  </div>
                  {dropdowns.servicesOffered && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div
                        className={`dropdown-option ${profile.servicesOffered === 'Hairstylist' ? 'selected' : ''}`}
                        onClick={() => selectOption('servicesOffered', 'Hairstylist')}
                      >
                        Hairstylist
                      </div>
                      <div
                        className={`dropdown-option ${profile.servicesOffered === 'MUA' ? 'selected' : ''}`}
                        onClick={() => selectOption('servicesOffered', 'MUA')}
                      >
                        MUA
                      </div>
                      <div
                        className={`dropdown-option ${profile.servicesOffered === 'Both' ? 'selected' : ''}`}
                        onClick={() => selectOption('servicesOffered', 'Both')}
                      >
                        Both
                      </div>
                    </div>
                  )}
                </div>
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
              
              {/* Google Maps Autocomplete - MOVED TO TOP */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Google Maps Address <span className="text-gray-500 text-xs">(Search and auto-fill below fields)</span>
                </label>
                <input
                  ref={autocompleteInputRef}
                  type="text"
                  placeholder="Search your address on Google Maps"
                  value={address.formatted_address || ""}
                  onChange={(e) => setAddress(prev => ({ ...prev, formatted_address: e.target.value }))}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Flat no/House no
                </label>
                <input
                  type="text"
                  placeholder="Flat no/House no"
                  value={address.flat_house_number || ""}
                  onChange={(e) => {
                    setAddress({
                      ...address,
                      flat_house_number: e.target.value,
                    });
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address.full_address || ""}
                  onChange={(e) => {
                    setAddress({
                      ...address,
                      full_address: e.target.value,
                    });
                  }}
                  ref={inputRef}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city || ""}
                  onChange={(e) => {
                    setAddress({
                      ...address,
                      city: e.target.value,
                    });
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  State
                </label>
                <div className="relative">
                  <div
                    className="select-field"
                    onClick={() => toggleDropdown('state')}
                  >
                    {address.state || 'Select State'}
                    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
                    </svg>
                  </div>
                  {dropdowns.state && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className={`dropdown-option ${address.state === 'Karnataka' ? 'selected' : ''}`}
                        onClick={() => selectOption('state', 'Karnataka', true)}
                      >
                        Karnataka
                      </div>
                      {locationData?.map((state) => (
                        <div
                          key={state._id}
                          className={`dropdown-option ${address.state === state.name ? 'selected' : ''}`}
                          onClick={() => selectOption('state', state.name, true)}
                        >
                          {state.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.postal_code || ""}
                  onChange={(e) => {
                    setAddress({
                      ...address,
                      postal_code: e.target.value,
                    });
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#840032] transition-colors"
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
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-red-500">*</span> Aadhar card / Driving license / Passport (Required)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                  onClick={() => {
                    if (profile.businessDescription.length > 350) {
                    toast.error("The profile can have a maximum of 350 Characters.");
                    } else if (documents.length === 0) {
                      toast.error("Please upload at least one address proof document (Aadhaar Card, Driving License, or Passport) to complete your profile.");
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
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden pt-24">
            {/* Experience Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                How many years of experience? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="5"
                value={other.experience || ""}
                onChange={(e) => {
                  setOther({
                    ...other,
                    experience: e.target.value,
                  });
                }}
                disabled={loading}
                className={`w-full px-4 py-3 border-2 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${
                  !other.experience || other.experience.trim() === '' 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-[#840032] focus:border-[#840032]'
                }`}
              />
              {(!other.experience || other.experience.trim() === '') && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
            </div>

            {/* Clients Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                How many clients have you served till date? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">(approx. number)</p>
              <input
                type="number"
                placeholder="50"
                value={other.clients || ""}
                onChange={(e) => {
                  setOther({
                    ...other,
                    clients: e.target.value,
                  });
                }}
                disabled={loading}
                className={`w-full px-4 py-3 border-2 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${
                  !other.clients || other.clients.trim() === '' 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-[#840032] focus:border-[#840032]'
                }`}
              />
              {(!other.clients || other.clients.trim() === '') && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
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
                                  // Handle error silently
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
                  {/* Show existing products */}
                  {other?.makeupProducts?.map((item, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={item || ""}
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
                      {/* Only show delete button if there's more than 1 product */}
                      {(other?.makeupProducts?.length || 0) > 1 && (
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
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Buttons Section */}
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if ((other?.makeupProducts?.length || 0) < 5) {
                        setOther({
                          ...other,
                          makeupProducts: [...(other?.makeupProducts || []), ""],
                        });
                      } else {
                        toast.error("Maximum 5 products allowed");
                      }
                    }}
                    disabled={(other?.makeupProducts?.length || 0) >= 5}
                    className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                      (other?.makeupProducts?.length || 0) >= 5
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-800"
                    }`}
                  >
                    Add more <span className="text-lg">+</span>
                  </button>
                  <div className="text-xs text-gray-500 text-center">
                    {(other?.makeupProducts?.length || 0)}/5 products
                  </div>
                </div>
              </div>
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
                How are you different from other artist? <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="I specialize in creating customized bridal looks that enhance natural beauty while ensuring long-lasting results, using only high-quality, cruelty-free products. My signature style focuses on glowing, radiant skin and timeless elegance, making every client feel confident and camera-ready."
                rows={4}
                value={other.usp || ""}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                  setOther({
                    ...other,
                    usp: e.target.value,
                  });
                  }
                }}
                disabled={loading}
                className={`w-full px-4 py-3 border-2 rounded-lg text-black placeholder-gray-500 italic focus:outline-none focus:ring-0 resize-none ${
                  !other.usp || other.usp.trim() === '' 
                    ? 'border-red-300 focus:border-red-500' 
                    : other.usp.length < 500 
                    ? 'border-yellow-300 focus:border-yellow-500'
                    : 'border-[#840032] focus:border-[#840032]'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <div className={`text-xs ${other.usp.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {other.usp.length > 500 ? `Maximum 500 characters allowed (${other.usp.length}/500)` : `${other.usp.length}/500 characters`}
                </div>
                <div className={`text-xs ${other.usp.length <= 500 ? 'text-green-600' : 'text-gray-400'}`}>
                  {other.usp.length <= 500 ? '✓ Valid' : 'Too long'}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={() => {
                  // Validate all fields
                  if (!other.experience || other.experience.trim() === '') {
                    toast.error("Please enter your years of experience.");
                    return;
                  }
                  if (!other.clients || other.clients.trim() === '') {
                    toast.error("Please enter the number of clients you've served.");
                    return;
                  }
                  if (!other.usp || other.usp.trim() === '') {
                    toast.error("Please describe how you're different from other artists.");
                    return;
                  }
                  if (other.usp.length > 500) {
                    toast.error("How are you different from other artist can have a maximum of 500 characters.");
                    return;
                  }
                  
                  // All validations passed, proceed with update
                  updateOther();
                }}
                disabled={loading || !other.experience || !other.clients || !other.usp || other.usp.length > 500}
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
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden pt-24">
            {/* Bridal Makeup Price */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Bridal makeup Starting price
              </label>
              <input
                type="number"
                placeholder="Bridal makeup Starting price"
                value={prices.bridal || ""}
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
                value={prices.party || ""}
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
                value={prices.groom || ""}
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
          <div className="flex flex-col gap-6 px-6 overflow-x-hidden pt-24">
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
                const file = e.target.files[0];
                if (file) {
                  handleFileSelect(file, 'cover');
                }
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
                    Upload multiple images at once (max 15 photos)
                  </p>
                </div>
                <button
                  onClick={() => {
                    photoRef.current?.click();
                  }}
                  disabled={loading || gallery.photos.length >= 15}
                  className="px-6 py-3 bg-[#840032] text-white rounded-xl hover:bg-[#6d0028] transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {gallery.photos.length >= 15 ? 'Max Reached' : 'Upload Photos'}
                </button>
              </div>
              
              {/* Multi-select Controls */}
              {gallery.photos.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={toggleMultiSelectMode}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm ${
                          isMultiSelectMode 
                            ? 'bg-[#840032] text-white hover:bg-[#6d0028] shadow-md' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {isMultiSelectMode ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Select
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Select Photos
                          </>
                        )}
                      </button>
                      
                      {isMultiSelectMode && (
                        <>
                          <button
                            onClick={selectAllPhotos}
                            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Select All
                          </button>
                          <button
                            onClick={deselectAllPhotos}
                            className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Deselect All
                          </button>
                          <div className="px-3 py-2 bg-white rounded-lg border border-gray-300 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">
                              {selectedPhotos.length} selected
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isMultiSelectMode && selectedPhotos.length > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Selected ({selectedPhotos.length})
                        </button>
                      )}
                      {/* Delete All button */}
                      <button
                        onClick={() => {
                          // Select all photos and force empty on confirm
                          setSelectedPhotos(gallery.photos.map((_, idx) => idx));
                          setIsMultiSelectMode(true);
                          setForceEmptyGallery(true);
                          setShowBulkDeleteModal(true);
                        }}
                        className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center gap-2 border border-red-300 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete All
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <input
              ref={photoRef}
                type="file"
                accept="image/*"
                multiple
              onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    // Process each file for cropping
                    files.forEach(file => {
                      handleFileSelect(file, 'gallery');
                    });
                  }
                }}
                className="hidden"
                disabled={loading || gallery.photos.length >= 15}
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
              {/* Show existing gallery photos */}
              {gallery.photos.map((item, index) => (
                <div
                  key={index}
                  className={`group relative w-full aspect-square rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all ${
                    isMultiSelectMode && selectedPhotos.includes(index)
                      ? 'border-[#840032] ring-2 ring-[#840032] ring-opacity-50'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={item}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Multi-select Checkbox */}
                  {isMultiSelectMode && (
                    <div className="absolute top-3 left-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedPhotos.includes(index)}
                          onChange={() => togglePhotoSelection(index)}
                          className="w-6 h-6 text-[#840032] bg-white border-2 border-white rounded-lg focus:ring-[#840032] focus:ring-2 shadow-lg cursor-pointer"
                        />
                        {selectedPhotos.includes(index) && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Delete Button - Only show when not in multi-select mode */}
                  {!isMultiSelectMode && (
                    <button
                      onClick={() => handleDeletePhoto(index)}
                      disabled={loading}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 disabled:opacity-50 shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {/* Show cropped photos before upload */}
              {cropFiles.map((file, index) => (
                <div
                  key={`crop-${index}`}
                  className="group relative w-full aspect-square rounded-lg overflow-hidden border border-blue-300 shadow-sm hover:shadow-md transition-shadow bg-blue-50"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Cropped photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Pending indicator */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Pending Upload
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={() => {
                      setCropFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
                
                {/* Upload Placeholder */}
                {gallery.photos.length + cropFiles.length < 15 && (
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
                      {gallery.photos.length + cropFiles.length}/15
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
                  <div className="relative">
                    <div
                      className="select-field"
                      onClick={() => toggleDropdown('documentType')}
                    >
                      {documentType || 'Select Document Type'}
                      <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <path d="M5.47887 8.71497L9.92626 0.843388C9.97457 0.757914 10 0.660956 10 0.56226C10 0.463564 9.97457 0.366606 9.92626 0.281132C9.87776 0.19533 9.80793 0.12414 9.72384 0.074772C9.63975 0.0254041 9.54438 -0.000388903 9.44739 4.43222e-06L0.552608 4.43222e-06C0.455618 -0.000388903 0.360249 0.0254041 0.276156 0.074772C0.192064 0.12414 0.122236 0.19533 0.0737419 0.281132C0.0254326 0.366606 0 0.463564 0 0.56226C0 0.660956 0.0254326 0.757914 0.0737419 0.843388L4.52113 8.71497C4.56914 8.8015 4.63876 8.87347 4.72288 8.92354C4.80701 8.97362 4.90263 9 5 9C5.09737 9 5.19299 8.97362 5.27712 8.92354C5.36124 8.87347 5.43086 8.8015 5.47887 8.71497ZM1.50483 1.12452H8.49517L5 7.30933L1.50483 1.12452Z" fill="#4F4F4F"/>
                      </svg>
                    </div>
                    {dropdowns.documentType && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div
                          className={`dropdown-option ${documentType === 'Aadhar Card' ? 'selected' : ''}`}
                          onClick={() => {
                            setDocumentType('Aadhar Card');
                            setDropdowns(prev => ({ ...prev, documentType: false }));
                          }}
                        >
                          Aadhar Card
                        </div>
                        <div
                          className={`dropdown-option ${documentType === 'Driving License' ? 'selected' : ''}`}
                          onClick={() => {
                            setDocumentType('Driving License');
                            setDropdowns(prev => ({ ...prev, documentType: false }));
                          }}
                        >
                          Driving License
                        </div>
                        <div
                          className={`dropdown-option ${documentType === 'Passport' ? 'selected' : ''}`}
                          onClick={() => {
                            setDocumentType('Passport');
                            setDropdowns(prev => ({ ...prev, documentType: false }));
                          }}
                        >
                          Passport
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">
                  Crop Image - Passport Size (2.5&quot; x 3.5&quot;)
                </h3>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setImgSrc('');
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdCancel size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-auto">
              {imgSrc && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={2.5 / 3.5} // Passport size aspect ratio
                      minWidth={100}
                      minHeight={140}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                        className="max-w-full max-h-96"
                      />
                    </ReactCrop>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    <p>• Drag to move the crop area</p>
                    <p>• Drag corners to resize</p>
                    <p>• Aspect ratio is locked to passport size (2.5&quot; x 3.5&quot;)</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImgSrc('');
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="px-4 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6d0028] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crop & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for auto-upload */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50" style={{zIndex: 9999}}>
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 text-[#840032]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-[#840032]">Uploading photo...</span>
          </div>
        </div>
      )}

      {/* Cropped Files Preview and Upload - Only show if there are files and not loading */}
      {cropFiles.length > 0 && !loading && (() => {
        console.log("Rendering upload button for", cropFiles.length, "files");
        return (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50" style={{zIndex: 9999}}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-black">
              Cropped Photos ({cropFiles.length})
            </h4>
            <button
              onClick={() => setCropFiles([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdCancel size={16} />
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {cropFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Photo {index + 1} - Ready to upload</span>
              </div>
            ))}
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-2">
            Debug: {cropFiles.length} files, Gallery: {gallery.photos.length}/15
          </div>
          
          {/* Test upload button */}
          <button
            onClick={() => {
              console.log("Test upload clicked");
              console.log("Crop files:", cropFiles);
              console.log("Gallery temp:", gallery.temp);
              console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
              console.log("Token:", localStorage.getItem("token") ? "Exists" : "Missing");
            }}
            className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs mb-2"
          >
            Test Debug Info
          </button>
          
          <button
            onClick={handleCroppedFilesUpload}
            disabled={loading}
            className="w-full px-3 py-2 bg-[#840032] text-white rounded-lg hover:bg-[#6d0028] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Uploading...' : `Upload ${cropFiles.length} Photo(s)`}
          </button>
        </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteType === 'cover' ? 'Delete Cover Photo' : 'Delete Photo'}
              </h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              {deleteType === 'cover' 
                ? 'Are you sure you want to delete the cover photo?' 
                : 'Are you sure you want to delete this photo?'
              }
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Selected Photos
              </h3>
              <button
                onClick={cancelBulkDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedPhotos.length} selected photo{selectedPhotos.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelBulkDelete}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete {selectedPhotos.length} Photo{selectedPhotos.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
