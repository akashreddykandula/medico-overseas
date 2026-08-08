import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiOutlineDocumentText } from "react-icons/hi";
import api from "../../lib/api";

const StudentApplicationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedCountry = watch("interestedCountry");

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await api.get("/countries");
      return data.data.countries;
    },
  });

  const { data: universities = [], isLoading: universitiesLoading } = useQuery({
    queryKey: ["universities", selectedCountry],
    queryFn: async () => {
      const country = countries.find((c) => c._id === selectedCountry);

      if (!country) return [];

      const { data } = await api.get(`/universities?country=${country.slug}`);

      return data.data.universities;
    },
    enabled: !!selectedCountry && countries.length > 0,
  });

  useEffect(() => {
    setValue("targetUniversity", "");
  }, [selectedCountry, setValue]);

  const createApplicationMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/applications/me", payload);
      return data.data.application;
    },

    onSuccess: () => {
      toast.success("Application started successfully");
      queryClient.invalidateQueries({
        queryKey: ["my-application"],
      });
      navigate("/portal");
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to start application");
    },
  });

  const onSubmit = (data) => {
    createApplicationMutation.mutate({
      interestedCountry: data.interestedCountry,
      targetUniversity: data.targetUniversity,
    });
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-50 text-coral">
            <HiOutlineDocumentText size={32} />
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold text-navy-600">
            Start Your Application
          </h1>

          <p className="mt-2 text-sm text-navy-400">
            Select your preferred country and university to begin your
            application.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-600">
              Interested Country
            </label>

            <select
              {...register("interestedCountry", {
                required: "Please select a country",
              })}
              disabled={countriesLoading}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-600 outline-none focus:border-coral"
            >
              <option value="">
                {countriesLoading ? "Loading countries..." : "Select a country"}
              </option>

              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>

            {errors.interestedCountry && (
              <p className="mt-1 text-xs text-red-500">
                {errors.interestedCountry.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-600">
              Target University
            </label>

            <select
              {...register("targetUniversity", {
                required: "Please select a university",
              })}
              disabled={!selectedCountry || universitiesLoading}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-600 outline-none focus:border-coral disabled:bg-slate-50"
            >
              <option value="">
                {!selectedCountry
                  ? "Select country first"
                  : universitiesLoading
                    ? "Loading universities..."
                    : universities.length === 0
                      ? "No universities available"
                      : "Select a university"}
              </option>

              {universities.map((university) => (
                <option key={university._id} value={university._id}>
                  {university.name}
                </option>
              ))}
            </select>

            {errors.targetUniversity && (
              <p className="mt-1 text-xs text-red-500">
                {errors.targetUniversity.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createApplicationMutation.isPending}
            className="w-full rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createApplicationMutation.isPending
              ? "Submitting..."
              : "Start Application"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/portal")}
            className="w-full rounded-xl border border-navy-100 px-5 py-3 text-sm font-semibold text-navy-600 hover:bg-navy-50"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
