import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PersonalInfo } from "../../profile/validators";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { languages } from "countries-list";
import { Country, State, City } from "country-state-city";
import { useState } from "react";

// Convert languages object to sorted array of unique languages
const languageList = Object.entries(languages)
  .map(([code, lang]) => ({
    code,
    name: lang.name
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Popular countries to show at the top
const popularCountries = [
  "United States",
  "China",
  "India",
  "Mexico",
  "Brazil"
];

// Get all countries and sort them
const allCountries = Country.getAllCountries();
const popularCountryObjects = popularCountries
  .map(name => allCountries.find(c => c.name === name))
  .filter(country => country !== undefined);
const otherCountries = allCountries
  .filter(country => !popularCountries.includes(country.name))
  .sort((a, b) => a.name.localeCompare(b.name));

const personalInfoSchema = z.object({
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 16 && age <= 100;
    }, "You must be between 16 and 100 years old to use this service"),
  currentLocation: z.string().min(1, "Current location is required"),
  nativeLanguage: z.string().min(1, "Native language is required"),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  onComplete: (data: PersonalInfo) => Promise<void>;
  initialData?: PersonalInfo;
  onBack: () => void;
}

export function PersonalInfoStep({ onComplete, initialData, onBack }: PersonalInfoStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse initial location data
  const initialLocationParts = initialData?.currentLocation?.split(", ") || [];
  const initialCity = initialLocationParts[0] || "";
  const hasState = initialLocationParts.length === 3;
  const initialState = hasState ? initialLocationParts[1] : "";
  const initialCountry = initialLocationParts[hasState ? 2 : 1] || "";

  // Find country and state codes from names
  const initialCountryObj = Country.getAllCountries().find(c => c.name === initialCountry);
  const initialStateObj = initialCountryObj 
    ? State.getStatesOfCountry(initialCountryObj.isoCode).find(s => s.name === initialState)
    : undefined;

  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryObj?.isoCode || "");
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedStateCode, setSelectedStateCode] = useState<string>(initialStateObj?.isoCode || "");

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      countryOfOrigin: initialData?.countryOfOrigin || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      currentLocation: initialData?.currentLocation || "",
      nativeLanguage: initialData?.nativeLanguage || "",
    },
  });

  const onSubmit = async (data: PersonalInfoForm) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="currentLocation"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "currentLocation"> }) => (
                <FormItem className="col-span-1 min-w-0 w-full max-w-[300px]">
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <Select 
                        onValueChange={(value) => {
                          const country = Country.getAllCountries().find(c => c.name === value);
                          setSelectedCountry(value);
                          setSelectedCountryCode(country?.isoCode || "");
                          setSelectedCity("");
                          setSelectedState("");
                          field.onChange(`${value}`);
                        }}
                        value={selectedCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Popular Countries */}
                          {popularCountryObjects.map((country) => (
                            <SelectItem key={country?.isoCode} value={country?.name || ""}>
                              {country?.flag} {country?.name}
                            </SelectItem>
                          ))}
                          {/* Divider */}
                          <SelectSeparator className="my-2" />
                          {/* All Other Countries */}
                          {otherCountries.map((country) => (
                            <SelectItem key={country.isoCode} value={country.name}>
                              {country.flag} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).length > 0 && (
                        <Select
                          onValueChange={(value) => {
                            const state = State.getStatesOfCountry(selectedCountryCode).find(s => s.name === value);
                            setSelectedState(value);
                            setSelectedStateCode(state?.isoCode || "");
                            field.onChange(`${selectedCity}${selectedCity ? ", " : ""}${value}, ${selectedCountry}`);
                          }}
                          value={selectedState}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state/province" />
                          </SelectTrigger>
                          <SelectContent>
                            {State.getStatesOfCountry(selectedCountryCode).map((state) => (
                              <SelectItem key={state.isoCode} value={state.name}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {selectedCountryCode && (
                        <Select
                          onValueChange={(value) => {
                            setSelectedCity(value);
                            field.onChange(`${value}, ${selectedState ? selectedState + ", " : ""}${selectedCountry}`);
                          }}
                          value={selectedCity}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {City.getCitiesOfState(selectedCountryCode, selectedStateCode)
                              .map((city) => (
                                <SelectItem key={city.name} value={city.name}>
                                  {city.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="countryOfOrigin"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "countryOfOrigin"> }) => (
                <FormItem className="col-span-1 min-w-0 w-full max-w-[250px]">
                  <FormLabel>Country of Origin</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country of origin" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Popular Countries */}
                        {popularCountryObjects.map((country) => (
                          <SelectItem key={country?.isoCode} value={country?.name || ""}>
                            {country?.flag} {country?.name}
                          </SelectItem>
                        ))}
                        {/* Divider */}
                        <SelectSeparator className="my-2" />
                        {/* All Other Countries */}
                        {otherCountries.map((country) => (
                          <SelectItem key={country.isoCode} value={country.name}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="nativeLanguage"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "nativeLanguage"> }) => (
                <FormItem className="col-span-1 min-w-0 w-full max-w-[220px]">
                  <FormLabel>Native Language</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your native language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageList.map((language) => (
                          <SelectItem key={language.code} value={language.name}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "dateOfBirth"> }) => (
                <FormItem className="col-span-1 min-w-0 w-full max-w-[180px]">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
